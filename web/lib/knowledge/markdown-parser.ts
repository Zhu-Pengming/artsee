import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import crypto from 'crypto';

export interface MarkdownFrontmatter {
  type?: string;
  status?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface ParsedMarkdown {
  frontmatter: MarkdownFrontmatter;
  content: string;
  contentHash: string;
  filePath: string;
}

export async function parseMarkdownFile(
  filePath: string
): Promise<ParsedMarkdown> {
  const absolutePath = path.resolve(filePath);
  const fileContent = await fs.readFile(absolutePath, 'utf-8');

  let parsed;
  try {
    parsed = matter(fileContent);
  } catch (error) {
    console.warn(`Warning: Failed to parse frontmatter, using empty object: ${error}`);
    parsed = { data: {}, content: fileContent };
  }

  const { data: frontmatter, content } = parsed;

  const contentHash = crypto
    .createHash('sha256')
    .update(content)
    .digest('hex');

  return {
    frontmatter: frontmatter as MarkdownFrontmatter,
    content,
    contentHash,
    filePath: absolutePath,
  };
}
