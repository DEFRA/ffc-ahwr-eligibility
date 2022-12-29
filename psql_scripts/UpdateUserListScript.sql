
CREATE table userListSbi(sbi numeric(9)); 
CREATE TABLE tempUserJson (data jsonb); 
\copy tempUserJson from 'C:\Users\aa000111\Downloads\dwh.json';
INSERT INTO userListSbi SELECT (data->>'sbi')::integer FROM tempUserJson;
UPDATE eligibility AS a SET access_granted = true FROM userListSbi AS b WHERE (a.sbi = b.sbi);
DROP TABLE userListSbi;
DROP TABLE tempUserJson;