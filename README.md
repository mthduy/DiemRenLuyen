# DiemRenLuyen

## Environment Variables
1. Tạo file `.env` trong thư mục gốc và thêm các biến sau:

```env
CLIENT_ID=hRXIOdVeTi1LCUMjiDNduvW7T1iX16CdTsZmH0zs
CLIENT_SECRET=hPRgrnfVgiGYZC9HeSiRixwY9gg8OjdEhJwmfXURzTSKxABTekAPT4yCMaAcX6SaWpOvkId5ZCNqgCpx8LGGrXFJAruEX20nDhumVZ5u9N95aPOIRgOSZnhmeOKNqUBi


2. vào .gitinore thêm .env 

3. kiểm tra thư mục gốc có babel.config.js chưa 
##babel.config.js
module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      ['module:react-native-dotenv', {
        "moduleName": "@env",
        "path": ".env",
        "allowlist": ["CLIENT_ID", "CLIENT_SECRET"]
      }]
    ]
  };
 