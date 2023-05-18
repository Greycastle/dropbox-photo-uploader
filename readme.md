# DropBox Photo Uploader

This application is built using standalone (no-build) ReactJS and can be hosted as plain Javascript files. It uses a Dropbox application to authenticate to your Dropbox account and simplifies file naming when uploading multiple dated images.

![Example usage](./app_usage.gif)

## Live demo

This application is running at:

https://greycastle.github.io/dropbox-photo-uploader/

## Running

You have to host the files on a server to avoid CORS issues (it isn't enough to open the html file locally).

Use [http-server](https://www.npmjs.com/package/http-server) or even better [browser-sync](https://www.npmjs.com/package/browser-sync) to help local development:

```shell
browser-sync start --server --files .
```