# DropBox Photo Uploader


## Live demo

This application is running at:

https://greycastle.github.io/dropbox-photo-uploader/

## Running

You have to host the files on a server to avoid CORS issues (it isn't enough to open the html file locally).

Use [http-server](https://www.npmjs.com/package/http-server) or even better [browser-sync](https://www.npmjs.com/package/browser-sync) to help local development:

```shell
browser-sync start --server --files .
```