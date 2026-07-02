export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/go/')) {
      const encodedTarget = url.pathname.substring(4);
      if (!encodedTarget) return new Response('Empty Target', { status: 400 });

      try {
        const targetUrlStr = decodeURIComponent(encodedTarget);
        const targetUrl = new URL(targetUrlStr);

        // Strip incoming tracking elements before forwarding to final host
        const forwardHeaders = new Headers(request.headers);
        forwardHeaders.set('Host', targetUrl.host);
        forwardHeaders.set('Origin', targetUrl.origin);
        forwardHeaders.set('Referer', targetUrl.origin);
        
        // Strip out specific Cloudflare proxy signatures
        forwardHeaders.delete('cf-connecting-ip');
        forwardHeaders.delete('cf-ray');
        forwardHeaders.delete('cookie');
        forwardHeaders.delete('x-forwarded-for');// Prevents host-level tracking

        const response = await fetch(targetUrl.toString(), {
          method: request.method,
          headers: forwardHeaders,
          body: request.body,
          redirect: 'manual'
        });

        // Strip downstream security headers that block iframe integration
        const cleanResponseHeaders = new Headers(response.headers);
        cleanResponseHeaders.delete('content-security-policy');
        cleanResponseHeaders.delete('x-frame-options');
        cleanResponseHeaders.delete('clear-site-data');
        
        // Allow your frontend app to read the payload cross-origin
        cleanResponseHeaders.set('Access-Control-Allow-Origin', '*');
        cleanResponseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: cleanResponseHeaders
        });

      } catch (err) {
        return new Response(`Gateway error: ${err.message}`, { status: 500 });
      }
    }

    return new Response('Stateless Gateway Operational.', { status: 200 });
  }
};
