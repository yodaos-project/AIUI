export default { latestStatus: 'idle', async onOpen(event) { await Promise.resolve(); event.waitUntil(Promise.resolve().then(() => { this.latestStatus = 'ready'; })); } };
