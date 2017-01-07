PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

DROP TABLE IF EXISTS sensors_data;

CREATE TABLE sensors_data (
	date timestamp DEFAULT (strftime('%s', 'now')) not null,
	temp real null,
	humi real null,
	cdio real null,
	PRIMARY KEY (date ASC)
);

COMMIT;
