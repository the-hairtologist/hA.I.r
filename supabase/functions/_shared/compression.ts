/**
 * Gzip compression utility for Edge Functions
 * Compresses JSON responses to reduce bandwidth by 60-70%
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

/**
 * Encode data using gzip compression
 */
export async function gzipEncode(data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(data));
      controller.close();
    },
  }).pipeThrough(new CompressionStream('gzip'));

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

/**
 * Create a compressed JSON response
 * Only compresses payloads > 1KB (smaller payloads not worth compressing)
 */
export async function compressedJsonResponse(
  data: any,
  status = 200,
  additionalHeaders: Record<string, string> = {}
): Promise<Response> {
  const json = JSON.stringify(data);

  // Only compress if payload > 1KB
  if (json.length < 1024) {
    return new Response(json, {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
        ...additionalHeaders,
      },
    });
  }

  try {
    const compressed = await gzipEncode(json);
    return new Response(compressed as unknown as BodyInit, {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
        ...corsHeaders,
        ...additionalHeaders,
      },
    });
  } catch (error) {
    console.error('Compression failed, returning uncompressed:', error);
    // Fallback to uncompressed if compression fails
    return new Response(json, {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
        ...additionalHeaders,
      },
    });
  }
}

/**
 * Create a compressed error response
 */
export async function compressedErrorResponse(
  error: string,
  status = 500,
  details?: any
): Promise<Response> {
  const errorData = details ? { error, details } : { error };

  return compressedJsonResponse(errorData, status);
}

/**
 * Export CORS headers for edge functions
 */
export { corsHeaders };
