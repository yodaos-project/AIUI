# Runtime Environment

You can preview an AIUI agent in development tools and run it on supported devices such as Rokid Glasses. Development tools make it easy to iterate and check results; a real device helps you verify what users actually see and experience.

## Preview in Development Tools

In AIUI Studio, you can edit a project and use the web simulator to preview its interface. The simulator helps you check page display, user input, and temple controls, and simulate how the display looks under different lighting conditions.

For example, when building a weather assistant, first check that the city, temperature, and buttons appear as expected, then try the simulated controls.

For the steps, see [Web Simulation and Debugging](../debug/web_debug.en-US.md). Craft also provides web-based project editing and preview.

## Why Test on a Real Device Too?

A preview helps you find issues quickly, but it can't fully reproduce the experience on a real device. Once the basic features work, check these on your target device:

- **Input and device capabilities**: Check voice, temple controls, the camera, and other features your agent uses. Simulated input can't fully reproduce real conditions.
- **Display**: Check that text, layout, and status messages are clear and readable. The display can differ between devices.
- **Performance**: Check startup, animation, and repeated interactions. An interface that runs smoothly on a computer may behave differently on a wearable device.
- **Real-world conditions**: Check that the agent remains usable when the network or lighting changes and during extended interaction.

Use results from the target device to assess the final interface, interaction, and performance. When you're ready, follow [Device Debugging with AIUI Studio](../debug/real_device_debug.en-US.md).
