# Take a Photo with the Camera

Open a full-screen Page on a device that supports photo capture, take one photo using the system viewfinder, and confirm that the photo data arrives.

## Declare Camera Permission

<!-- aiui-tutorial-step -->

Add `CAMERA` to the `permissions` array in `app.json` and keep the project’s existing settings. Allow camera access when the system prompts you.

```json
{
  "permissions": ["CAMERA"]
}
```

<!-- /aiui-tutorial-step -->

## Capture the Photo from the Video Track

<!-- aiui-tutorial-step -->

Save the example as the project home page at `pages/index/index.ink`. Get a video track from `getUserMedia()` and use `ImageCapture.takePhoto()` to get the encoded photo as a `Blob`. Stop all tracks when you finish using the stream.

```html
<script setup>
export default {
  data: { capturing: false, status: '' },

  async takePhoto() {
    if (this.data.capturing) return;
    this.setData({ capturing: true, status: 'Taking photo' });
    let stream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (this.unloaded) return;

      this.cameraStream = stream;
      const [track] = stream.getVideoTracks();
      if (!track) throw new Error('No camera track');

      const capture = new ImageCapture(track);
      const photo = await capture.takePhoto({
        mode: 'default',
        enableSystemPreview: true
      });

      if (!this.unloaded) {
        this.setData({ status: `Captured ${photo.size} B (${photo.type})` });
      }
    } catch {
      if (!this.unloaded) this.setData({ status: 'Could not capture a photo' });
    } finally {
      stream?.getTracks().forEach((track) => track.stop());
      this.cameraStream = null;
      if (!this.unloaded) this.setData({ capturing: false });
    }
  },

  onUnload() {
    this.unloaded = true;
    this.cameraStream?.getTracks().forEach((track) => track.stop());
  }
};
</script>

<page>
  <view>
    <button bindtap="takePhoto" disabled="{{ capturing }}">Take photo</button>
    <text>{{ status }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Tap “Take photo” and confirm the shot in the system viewfinder. Back on the page, check that the photo’s byte count and image type appear. Take another photo to confirm that the camera can reopen after release.

See [Media Capture](/AIUI/api/media-media-capture) for viewfinder and photo settings.
