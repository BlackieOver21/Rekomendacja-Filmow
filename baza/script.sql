drop table account cascade;
create table account(
id SERIAL NOT NULL PRIMARY KEY,
username VARCHAR(64) not null unique,
password VARCHAR(1024) not null
);