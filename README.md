# servewp
## Use expressjs instead of nginx / apache to serve wordpress sites.
## Can be used for both development & production
### Use foreverjs to serve in production

## Debian / Ubuntu
### Make sure you have php-fpm installed and listening on port 9000 (Can be customized)
```bash
sudo apt-get install php7.0-fpm -y
sudo apt-get install php-soap -y
sudo apt-get install php-curl -y
sudo apt-get install php-bcmath -y
# Etc... Could be more dependencies depending on your php version etc.
cd /etc/php/7.0/fpm/pool.d
sudo nano www.conf
# Uncomment this line: listen = /run/php/php7.0-fpm.sock
# Add this line: listen = 127.0.0.1:9000
# Ctrl + X & Save -> Restart serve:
sudo service php7.0-fpm restart
```

## Mac
```bash
brew install php72
brew services start php@7.2
# If you want to customise port (default is 9000) you can edit this file:
# /usr/local/etc/php/7.2/php-fpm.d/www.conf -> listen = 127.0.0.1:9000
```

## Windows
Install php-fpm https://windows.php.net/download/
Be sure php is running & listening on tcp/ip 127.0.0.1:9000

## Database
MariaDB is recommended in production, but were using sqlite here for simple development setup.

## WP-CLI (Optional)
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar

# Installation Guide
### In a new clean directory:
```bash
git clone https://github.com/steffanhalv/servewp .
npm i
npm run dev
```

