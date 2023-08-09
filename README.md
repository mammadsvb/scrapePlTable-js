# ScrapePlTable-js

## Introduction

scrape premierleague table and store information in mongoDB.the information is updated every day.

## Requirement

```
$ puppeteer (connect to the site)
$ cheerio (scrape info)
$ mongoose (connect to database)
$ node-schedule (run according to planning)
```
run this code for the first time with await Team.insertMany(info) then comment it.
