/**
 * Persona loader
 * 
 * Loads persona prompts from markdown files
 */

import fs from 'fs';
import path from 'path';

const PROMPTS_DIR = path.join(process.cwd(), 'lib', 'knowledge', 'prompts');

/**
 * Load persona prompt
 * 
 * @param name - Persona name (e.g., 'artsee')
 * @param version - Version (e.g., 'v1')
 * @returns Persona prompt text
 */
export function loadPersona(name: string, version: string = 'v1'): string {
  const filename = `persona.${name}.${version}.md`;
  const filepath = path.join(PROMPTS_DIR, filename);

  try {
    return fs.readFileSync(filepath, 'utf-8');
  } catch (error) {
    console.error(`Failed to load persona: ${filename}`, error);
    return '';
  }
}
