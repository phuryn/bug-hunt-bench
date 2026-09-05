/* Microsoft Clarity — session analytics (added 2026-09-05).
   This is the standard Clarity snippet, kept in a file rather than inline in the
   HTML because the CSP has no 'unsafe-inline'. It only injects the async loader;
   the hosts it needs (www.clarity.ms, scripts.clarity.ms, *.clarity.ms, c.bing.com)
   are allowlisted in _headers. Project id: ydkued0kxm. */
(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "ydkued0kxm");
