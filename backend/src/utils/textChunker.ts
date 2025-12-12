export interface Chunk {
  content: string;
  chunkIndex: number;
  pageNumber: number;
}
//  ai 
/**
 * Split text into chunks for better AI processing.
 *
 * - Preserves paragraph boundaries where possible (paragraphs inside a chunk are separated by "\n\n").
 * - Splits very large paragraphs by words into overlapping chunks.
 * - Returns an array of objects with content, chunkIndex and pageNumber (pageNumber set to 0).
 *
 * @param text - Full text to chunk
 * @param chunkSize - Target size per chunk (in words). Must be >= 1.
 * @param overlap - Number of words to overlap between adjacent chunks. Clamped to [0, chunkSize-1].
 * @returns Array of Chunk
 */
export const chunkText = (
  text: string,
  chunkSize: number = 500,
  overlap: number = 50
): Chunk[] => {
  // Normalize numeric inputs
  chunkSize = Math.max(1, Math.floor(Number(chunkSize) || 500));
  overlap = Math.max(0, Math.floor(Number(overlap) || 0));
  if (overlap >= chunkSize) overlap = Math.max(0, chunkSize - 1);

  // Validate text
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  // Normalize line endings and whitespace, keep paragraph structure
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .trim();

  // Split into paragraphs and filter out empty ones
  const paragraphs = cleanedText
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: Chunk[] = [];
  let chunkIndex = 0;

  const pushChunkFromWords = (wordsArr: string[]) => {
    if (!wordsArr || wordsArr.length === 0) return;
    chunks.push({
      content: wordsArr.join(' '),
      chunkIndex: chunkIndex++,
      pageNumber: 0,
    });
  };

  const pushChunkFromParagraphs = (paragraphsArr: string[]) => {
    if (!paragraphsArr || paragraphsArr.length === 0) return;
    chunks.push({
      content: paragraphsArr.join('\n\n'),
      chunkIndex: chunkIndex++,
      pageNumber: 0,
    });
  };

  // Accumulators
  let currentChunkParagraphs: string[] = [];
  let currentChunkWords: string[] = [];

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.split(/\s+/).filter(Boolean);
    const pLen = paragraphWords.length;

    // If paragraph itself exceeds chunk size, flush any accumulated chunk and split the paragraph
    if (pLen > chunkSize) {
      if (currentChunkParagraphs.length > 0) {
        // Flush paragraph-preserving chunk first
        pushChunkFromParagraphs(currentChunkParagraphs);

        // collect overlap words from flushed chunk
        const flushedWords = currentChunkParagraphs.join(' ').split(/\s+/).filter(Boolean);
        const overlapWordsForNext = overlap > 0 ? flushedWords.slice(Math.max(0, flushedWords.length - overlap)) : [];
        currentChunkParagraphs = [];
        currentChunkWords = overlapWordsForNext.slice();
      } else {
        currentChunkWords = [];
      }

      // Split the large paragraph into overlapping word-based chunks
      const step = Math.max(1, chunkSize - overlap);
      for (let i = 0; i < paragraphWords.length; i += step) {
        const slice = paragraphWords.slice(i, i + chunkSize);
        pushChunkFromWords(slice);
        if (i + chunkSize >= paragraphWords.length) break;
      }
      continue;
    }

    // Determine current words count
    const currentWordsCount =
      currentChunkParagraphs.length > 0
        ? currentChunkParagraphs.join(' ').split(/\s+/).filter(Boolean).length
        : currentChunkWords.length;

    // If adding this paragraph would exceed chunk size, flush current chunk and start a new one with overlap
    if (currentWordsCount + pLen > chunkSize) {
      const flushedWords =
        currentChunkParagraphs.length > 0
          ? currentChunkParagraphs.join(' ').split(/\s+/).filter(Boolean)
          : currentChunkWords.slice();

      const overlapWords = overlap > 0 ? flushedWords.slice(Math.max(0, flushedWords.length - overlap)) : [];

      // Flush existing chunk: prefer paragraph-preserving if available
      if (currentChunkParagraphs.length > 0) {
        pushChunkFromParagraphs(currentChunkParagraphs);
      } else if (currentChunkWords.length > 0) {
        pushChunkFromWords(currentChunkWords);
      }

      // Start new chunk as overlap words + this paragraph
      currentChunkParagraphs = [];
      currentChunkWords = overlapWords.concat(paragraphWords);

      // If there is no overlap requested, restart paragraph accumulation
      if (overlap === 0) {
        currentChunkParagraphs = [paragraph];
        currentChunkWords = paragraphWords.slice();
      }
    } else {
      // Safe to append paragraph to current paragraph-preserving chunk
      currentChunkParagraphs.push(paragraph);
      currentChunkWords = currentChunkParagraphs.join(' ').split(/\s+/).filter(Boolean);
    }

    // If current chunk reached or exceeded chunk size, flush accordingly
    if (currentChunkWords.length >= chunkSize) {
      if (currentChunkWords.length === chunkSize) {
        if (currentChunkParagraphs.length > 0) {
          pushChunkFromParagraphs(currentChunkParagraphs);
          const flushedWords = currentChunkParagraphs.join(' ').split(/\s+/).filter(Boolean);
          const overlapWords = overlap > 0 ? flushedWords.slice(Math.max(0, flushedWords.length - overlap)) : [];
          currentChunkParagraphs = [];
          currentChunkWords = overlapWords;
        } else {
          pushChunkFromWords(currentChunkWords);
          currentChunkWords = [];
        }
      } else {
        // Larger than chunkSize: split into first and remainder
        const first = currentChunkWords.slice(0, chunkSize);
        const remainder = currentChunkWords.slice(chunkSize);
        pushChunkFromWords(first);
        const overlapPart = overlap > 0 ? first.slice(Math.max(0, first.length - overlap)) : [];
        currentChunkWords = overlapPart.concat(remainder);
        currentChunkParagraphs = [];
      }
    }
  }

  // Push any remaining content
  if (currentChunkParagraphs.length > 0) {
    pushChunkFromParagraphs(currentChunkParagraphs);
  } else if (currentChunkWords.length > 0) {
    pushChunkFromWords(currentChunkWords);
  }

  // Defensive fallback
  if (chunks.length === 0 && cleanedText.length > 0) {
    const allWords = cleanedText.split(/\s+/).filter(Boolean);
    const step = Math.max(1, chunkSize - overlap);
    for (let i = 0; i < allWords.length; i += step) {
      const slice = allWords.slice(i, i + chunkSize);
      pushChunkFromWords(slice);
      if (i + chunkSize >= allWords.length) break;
    }
  }

  return chunks;
};

/* -------------------------------------------------------------------------- */
/*                              findRelevantChunks                            */
/* -------------------------------------------------------------------------- */

/**
 * Result returned for a relevant chunk.
 */
export interface RelevantChunk {
  content: string;
  chunkIndex: number;
  pageNumber: number;
  score: number; // normalized score used for ranking
  rawScore: number; // pre-normalized raw score
  matchedWords: number; // number of unique query words found in this chunk
}

/**
 * Escape a string for use in a RegExp
 */
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Find and score relevant chunks by simple keyword matching.
 *
 * Scoring rules (heuristic):
 * - Exact whole-word matches score higher (weight 3).
 * - Partial / substring matches score lower (weight 1).
 * - Multiple unique query words found grant a bonus.
 * - Score is normalized by sqrt(number of words in chunk).
 * - Slight position bonus for earlier chunks.
 *
 * @param chunks - Array of Chunk objects to search
 * @param query - Search query string
 * @param maxChunks - Maximum number of results to return (default 3)
 * @returns Array of RelevantChunk sorted by descending score
 */
export const findRelevantChunks = (
  chunks: Chunk[],
  query: string,
  maxChunks: number = 3
): RelevantChunk[] => {
  if (!Array.isArray(chunks) || chunks.length === 0) return [];
  if (!query || typeof query !== 'string' || query.trim().length === 0) return [];

  // Common stop words (small set; extend as needed)
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by', 'this', 'that', 'it'
  ]);

  // Clean and extract query words (remove punctuation, lowercase)
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}_]/gu, '')) // remove punctuation (unicode-aware)
    .filter(Boolean)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (queryWords.length === 0) return [];

  const results: RelevantChunk[] = chunks.map((chunk, index) => {
    const content = (chunk.content || '').toLowerCase();
    const contentWords = content.split(/\s+/).filter(Boolean);
    const nWords = Math.max(1, contentWords.length);

    let rawScore = 0;
    const matchedUnique = new Set<string>();

    for (const q of queryWords) {
      // exact whole-word match count
      const exactRe = new RegExp(`\\b${escapeRegExp(q)}\\b`, 'gu');
      const exactMatches = (content.match(exactRe) || []).length;
      rawScore += exactMatches * 3;

      // partial matches (substring) excluding those already counted as exact
      const partialRe = new RegExp(escapeRegExp(q), 'gu');
      const partialMatches = (content.match(partialRe) || []).length;
      const partialOnly = Math.max(0, partialMatches - exactMatches);
      rawScore += partialOnly * 1;

      if (exactMatches + partialOnly > 0) matchedUnique.add(q);
    }

    // Bonus for multiple unique query words found
    const uniqueWordsFound = matchedUnique.size;
    if (uniqueWordsFound > 1) {
      rawScore += uniqueWordsFound * 2;
    }

    // Normalize score by sqrt(length) to dampen long documents
    const normalizedScore = rawScore / Math.sqrt(nWords);

    // Small position bonus for earlier chunks (earlier chunks slightly preferred)
    const positionBonus = (1 - index / Math.max(1, chunks.length)) * 0.05;
    const finalScore = normalizedScore + positionBonus;

    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      score: finalScore,
      rawScore,
      matchedWords: uniqueWordsFound,
    };
  });

  // Filter out zero-scored chunks and sort
  const scored = results
    .filter((r) => r.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.matchedWords !== a.matchedWords) return b.matchedWords - a.matchedWords;
      return a.chunkIndex - b.chunkIndex;
    })
    .slice(0, Math.max(0, Math.floor(maxChunks)));

  return scored;
};

/* ------------------------------ Example usage ------------------------------

 import { chunkText, findRelevantChunks } from './text-utils';

 const text = "Long text ...";
 const chunks = chunkText(text, 200, 40);
const relevant = findRelevantChunks(chunks, "search keywords here", 5);
console.log(relevant);

---------------------------------------------------------------------------- */