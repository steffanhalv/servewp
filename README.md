# Use expressjs to serve WP in both development & production mode with php-fpm

## Quick Start

### Development
```bash
git clone https://github.com/steffanhalv/servewp .
npm i
cd public
wp core download
npm run dev
```
Then go to http://localhost to start Wordpress installation process

### Production
```bash
npm run build
npm i forever -g
cd dist
forever index.js
```

## HTTPS Support
### Edit index.js

1. Uncomment all https lines
2. Replace path to cert files
3. Restart forever using:

```bash
sudo forever restartall
```

___

# Prerequisite

Make sure you have php-fpm installed and listening on tcp/ip port 9000 _(can be customized)_

## Install PHP-FPM for Mac
```bash
brew install php72
brew services start php@7.2
# If you want to customise port (default is 9000) you can edit this file:
# /usr/local/etc/php/7.2/php-fpm.d/www.conf
# Change line: listen = 127.0.0.1:9000
```

## Install PHP-FPM for Windows
Install php-fpm from https://windows.php.net/download/

Be sure php is running & listening on tcp/ip 127.0.0.1:9000

## Install PHP-FPM for Debian / Ubuntu
```bash
sudo apt-get install php7.0-fpm -y
sudo apt-get install php-soap -y
sudo apt-get install php-curl -y
sudo apt-get install php-bcmath -y
cd /etc/php/7.0/fpm/pool.d
sudo nano www.conf
# Uncomment: listen = /run/php/php7.0-fpm.sock
# Add: listen = 127.0.0.1:9000
# Then: Ctrl + X & Save -> Restart server:
sudo service php7.0-fpm restart
```

Database is also required for Wordpress as usual

## Database
MariaDB is a good option: https://mariadb.com/

Ex. Mac: 
```bash
brew install mariadb
brew services start mariadb
mysql -u root
create database dev
```

**Configure wp-config to use MariaDB:**
- Or use the standard WP Installation process: https://codex.wordpress.org/Installing_WordPress
```php
/** The name of the database for WordPress */
define('DB_NAME', 'dev');

/** MySQL database username */
define('DB_USER', 'root');

/** MySQL database password */
define('DB_PASSWORD', '');

/** MySQL hostname */
define('DB_HOST', 'localhost');
```

If you dont want to manually download Wordpress, use WP-CLI

## WP-CLI (Optional)
```bash
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp
wp cli update --nightly --yes
```
