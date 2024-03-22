# How to use the LinkedIn Company Profile Scraper Extension

**Last Updated:** March 19, 2024

**Author:** Luke Wilson

> **Please Note:** This extension requires an account and API key from the
[**LinkedIn Company Data
API**](https://rapidapi.com/williambarberjr/api/linkedin-company-data)
via *RapidAPI*. It is a Freemium model, so a basic free account is
available (as of writing March 2024).

> A **[Basic](https://rapidapi.com/williambarberjr/api/linkedin-company-data/pricing)**
(free) tier API key is included in the base code for this extension,
which will give you 100 companies / month, and 10 search results /
month. Any results over this will charge +US\$0.008 each.

## 1. Go to an Airtable base you need import LinkedIn data to

If you haven't installed the extension, please first install the Scripting extension then copy/paste this codebase into that.

## 2. Click on Extensions

## 3. Find the \"LinkedIn Company Profile Scraper\" extension and click on \"Run\"

This will load the script interface. If the extension can\'t be found,
contact a base admin to install it.

## 4. Table creation or updating options

### 4.1. Click on \"Create new table\" if you need to make a fresh one and give it a name. The LinkedIn scraper will pull in the company profile data along with the latest 10 company posts, so it will create two tables. This will also pre-populate the table with the required fields for the scraper to fill in.

### 4.2. Or you can click on \"Add fields to existing table\" if you already have tables you want to amend. This will still automatically create the necessary fields for the scraper in the selected tables.

This will present you with a drop-down menu to select from existing
tables in the current base.

## 5. You will then see a choice on how you want to scrape the LinkedIn data into the Airtable.

-   **\"Manually Input URL(s)\"** -- You can enter a single company
    > profile URL or a comma separated list of URLs here. URLs should be
    > formatted like so: https://www.linkedin.com/company/hilton/ for
    > example.

-   **\"Lookup URL Field in a Table\"** -- This will give you some new
    > options to let you select a table and a field column which has a
    > list of LinkedIn URLs that you want to scrape as a batch.

If you make a mistake and need to change some of the settings, you will
need to stop the script and run it again to reset it.

## 6. Manually Input URL(s) options

### 6.1. Click on \"Manually Input URL(s)\"

You will be presented with a URL input field to setup the scrape.

Once it has finished, you will be presented with the results of the
scrape.

**Continue down to [point number 8](#8-starting-the-data-scraping)**

## 7. Lookup URL Field in a Table options

Selecting the Lookup Field option will present you with some options to
configure first before you can commence the scraping.

### 7.1. Click on \"Lookup URL Field in a Table\"

First you will be asked to select a **reference** table where you want
to source the URL data.

Next you will have to select the relevant field from the table you just
selected where the URLs are stored.

Finally, select a view from your table.

When you press the "Next" button, the scrape will begin. This may take
longer depending on how many URLs are in your reference table, as it has
to process them first before the data can be pulled into the Airtable.

**Continue down to [point number 8](#8-starting-the-data-scraping)**

## 8. Starting the data scraping

Clicking on the "Next" button will present begin the scraping process.

The tables will begin to populate automatically row by row as it finds
the results from the specified URLs.

### 8.1. Once the scrape has finished, you\'ll be presented with the results so you can see exactly how many company profiles and posts you imported, and what might have been skipped.

## 9. See Also...

### 9.1. Reporting any bugs or requesting features

If you find a bug or error with the scraper, or if you have any
suggestions, please leave a comment on this page.
