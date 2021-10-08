
## u2worker-stormkit

https://github.com/suconghou/u2worker

https://github.com/suconghou/u2worker-deno

https://github.com/suconghou/netlifyworker


req 

使用结构

```
{
    method:'string',
    headers:{},
    path:'pathname',
}
```

res

使用结构

```
res.status(statusCode);
res.setHeader(k, v);
res.send(body);
```

### 部署

本地 `make build`

控制台开启`serverless`

`Serverless entry file`

```
functions/api.js
```

`Public folder`

```
publish
```


`Build command`

```
pwd && ls -lha && sed -i 's/typeof.*body.*object.*stringify.*body.*://g' __sk__server.utils.js && cat __sk__server.utils.js
```