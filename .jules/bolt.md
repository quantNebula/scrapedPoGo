## 2024-05-22 - [Node.js Stream Destruction Hang]
**Learning:** `response.destroy()` on an IncomingMessage stream does NOT emit 'end', only 'close'. Waiting for 'end' after destroying the stream causes the promise to hang until timeout.
**Action:** When manually destroying a stream (e.g., after reading enough bytes), explicitly resolve the promise or listen for the 'close' event.
