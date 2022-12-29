/* mypath in line 7 is the folder path
myfile.json in line 7 is the name of the users.json file
userusers.json must be in newline delimetered format NDJson */

CREATE table userListSbi(sbi numeric(9)); 
CREATE TABLE tempUserJson (data jsonb); 
\copy tempUserJson from 'mypath\users.json';
INSERT INTO userListSbi SELECT (data->>'sbi')::integer FROM tempUserJson;
UPDATE eligibility AS a SET access_granted = true FROM userListSbi AS b WHERE (a.sbi = b.sbi);
DROP TABLE userListSbi;
DROP TABLE tempUserJson;