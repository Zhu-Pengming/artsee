import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { encode } from 'gpt-tokenizer';
import type { Root, Heading, Content } from 'mdast';

export interface ChunkMetadata {
  sourceUrl?: string;
  sourceType?: 'official' | 'forum' | 'blog' | 'internal';
  fetchedAt?: Date;
  confidence?: number;
}

export interface DocumentChunk {
  text: string;
  headingPath: string;
  chunkIndex: number;
  tokenCount: number;
  metadata?: ChunkMetadata;
}

const MIN_CHUNK_TOKENS = 50;
const MAX_CHUNK_TOKENS = 500;
const OVERLAP_TOKENS = 120; // Phase 2.3: Increased from 50 to 120

export async function chunkMarkdown(
  markdownContent: string,
  documentTitle: string,
  metadata?: ChunkMetadata
): Promise<DocumentChunk[]> {
  const processor = unified().use(remarkParse);
  const tree = processor.parse(markdownContent) as Root;

  const sections = extractSections(tree, documentTitle);
  const chunks: DocumentChunk[] = [];

  let chunkIndex = 0;
  let pendingChunk: { text: string; headingPath: string } | null = null;

  for (const section of sections) {
    const sectionText = `${section.headingPath}\n\n${section.content}`;
    const tokenCount = countTokens(sectionText);

    if (tokenCount > MAX_CHUNK_TOKENS) {
      if (pendingChunk) {
        chunks.push({
          ...pendingChunk,
          chunkIndex: chunkIndex++,
          tokenCount: countTokens(pendingChunk.text),
          metadata,
        });
        pendingChunk = null;
      }

      const subChunks = splitLargeSection(section, documentTitle);
      for (const subChunk of subChunks) {
        chunks.push({
          text: subChunk.text,
          headingPath: subChunk.headingPath,
          chunkIndex: chunkIndex++,
          tokenCount: countTokens(subChunk.text),
          metadata,
        });
      }
    } else if (tokenCount < MIN_CHUNK_TOKENS && pendingChunk) {
      pendingChunk.text += `\n\n${sectionText}`;
      pendingChunk.headingPath = section.headingPath;
    } else {
      if (pendingChunk) {
        chunks.push({
          ...pendingChunk,
          chunkIndex: chunkIndex++,
          tokenCount: countTokens(pendingChunk.text),
          metadata,
        });
      }
      pendingChunk = { text: sectionText, headingPath: section.headingPath };
    }
  }

  if (pendingChunk) {
    chunks.push({
      ...pendingChunk,
      chunkIndex: chunkIndex++,
      tokenCount: countTokens(pendingChunk.text),
      metadata,
    });
  }

  return chunks;
}

interface Section {
  headingPath: string;
  content: string;
  depth: number;
}

function extractSections(tree: Root, documentTitle: string): Section[] {
  const sections: Section[] = [];
  const headingStack: Array<{ text: string; depth: number }> = [
    { text: documentTitle, depth: 1 },
  ];

  let currentSection: Section | null = null;
  let currentContent: string[] = [];

  for (const node of tree.children) {
    if (node.type === 'heading') {
      if (currentSection) {
        currentSection.content = currentContent.join('\n').trim();
        sections.push(currentSection);
        currentContent = [];
      }

      const headingNode = node as Heading;
      const headingText = extractText(headingNode);

      while (
        headingStack.length > 1 &&
        headingStack[headingStack.length - 1].depth >= headingNode.depth
      ) {
        headingStack.pop();
      }

      headingStack.push({ text: headingText, depth: headingNode.depth });

      const headingPath = headingStack.map((h) => h.text).join(' > ');

      currentSection = {
        headingPath,
        content: '',
        depth: headingNode.depth,
      };
    } else {
      const nodeText = nodeToMarkdown(node);
      if (nodeText.trim()) {
        currentContent.push(nodeText);
      }
    }
  }

  if (currentSection) {
    currentSection.content = currentContent.join('\n').trim();
    sections.push(currentSection);
  }

  return sections;
}

function splitLargeSection(
  section: Section,
  documentTitle: string
): Array<{ text: string; headingPath: string }> {
  const paragraphs = section.content.split('\n\n');
  const subChunks: Array<{ text: string; headingPath: string }> = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    const testChunk = currentChunk
      ? `${currentChunk}\n\n${para}`
      : `${section.headingPath}\n\n${para}`;

    if (countTokens(testChunk) > MAX_CHUNK_TOKENS && currentChunk) {
      subChunks.push({
        text: `${section.headingPath}\n\n${currentChunk}`,
        headingPath: section.headingPath,
      });
      currentChunk = para;
    } else {
      currentChunk = currentChunk ? `${currentChunk}\n\n${para}` : para;
    }
  }

  if (currentChunk) {
    subChunks.push({
      text: `${section.headingPath}\n\n${currentChunk}`,
      headingPath: section.headingPath,
    });
  }

  return subChunks;
}

function extractText(node: Content): string {
  if ('value' in node) {
    return node.value;
  }
  if ('children' in node) {
    return node.children.map(extractText).join('');
  }
  return '';
}

function nodeToMarkdown(node: Content): string {
  const processor = unified().use(remarkStringify);
  return processor.stringify({ type: 'root', children: [node] } as Root);
}

function countTokens(text: string): number {
  return encode(text).length;
}
