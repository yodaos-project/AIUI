export default { latestStatus: "idle", onOpen(event) { event.waitUntil(Promise.resolve().then(() => { this.latestStatus = "ready"; })); } };
