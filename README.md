# Next.js TesloShop App
Para correr localmente, se necesita la base de datos...

```
docker-compose up -d
```

* El -d significa __detached__

* MongoDB URL local
```
mongodb://localhost:27017/teslodb
```

* Reconstruir los módulos de Node y levantar Next
```
npm install
npm run dev
```

## Configurar las variables de entorno
Renombrar el archivo __.env.template__ a __.env__

## Llenar la base de datos con información de pruebas
```http://localhost:3000/api/seed ```