// Cloudflare Worker API for NCPA Notes

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // GET /notes - Fetch all notes
      if (path === '/notes' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM notes ORDER BY timestamp DESC'
        ).all();

        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // POST /notes - Create a new note
      if (path === '/notes' && request.method === 'POST') {
        const { title, content } = await request.json();

        const result = await env.DB.prepare(
          'INSERT INTO notes (title, content, timestamp, completed) VALUES (?, ?, ?, ?)'
        ).bind(title, content, Date.now(), 0).run();

        return new Response(JSON.stringify({
          success: true,
          id: result.meta.last_row_id
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // PUT /notes/:id - Update a note
      if (path.startsWith('/notes/') && request.method === 'PUT') {
        const id = path.split('/')[2];
        const { title, content, completed } = await request.json();

        await env.DB.prepare(
          'UPDATE notes SET title = ?, content = ?, completed = ? WHERE id = ?'
        ).bind(title, content, completed ? 1 : 0, id).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // DELETE /notes/:id - Delete a note
      if (path.startsWith('/notes/') && request.method === 'DELETE') {
        const id = path.split('/')[2];

        await env.DB.prepare('DELETE FROM notes WHERE id = ?').bind(id).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 404 - Not found
      return new Response('Not Found', {
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
