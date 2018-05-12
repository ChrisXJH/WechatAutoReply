# Wechat Auto Reply Robot


## Run


```
npm install 
npm start
```

Please set up your own configuration server for customizable reply messages.

## Build

### Container

```
npm run build-image
```

### Start Container

```
docker run -d --env CONFIG_SERVER=<config_server_url> wechat-auto-reply:latest
docker logs -f <container_id>
```

## Configuration

Sample configuration can be found: [https://github.com/ChrisXJH/config-server](https://github.com/ChrisXJH/config-server)
