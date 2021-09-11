CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'rootROOT@12';
FLUSH PRIVILEGES;



CREATE DATABASE store;

CREATE TABLE store.users (
    id INT NOT NULL AUTO_INCREMENT,
    name NVARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE INDEX id_UNIQUE (id ASC),
    UNIQUE INDEX email_UNIQUE (email ASC));


CREATE TABLE store.products (
        id INT NOT NULL AUTO_INCREMENT,
        name NVARCHAR(50) NOT NULL,
        price DOUBLE NOT NULL,
        userId INT NOT NULL,
        PRIMARY KEY (id),
        UNIQUE INDEX id_UNIQUE (id ASC),
        INDEX fk_new_table_1_idx (userId ASC),
        CONSTRAINT fk_new_table_1
          FOREIGN KEY (userId)
          REFERENCES store.users (id)
          ON DELETE cascade
          ON UPDATE cascade);

GRANT ALL PRIVILEGES ON *.* TO 'newuser'@'localhost';
FLUSH PRIVILEGES;
