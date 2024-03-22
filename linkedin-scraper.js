//   _      _       _            _ _____          _____                                       __   ___  
//  | |    (_)     | |          | |_   _|        / ____|                                     /_ | / _ \ 
//  | |     _ _ __ | | _____  __| | | |  _ __   | (___   ___ _ __ __ _ _ __   ___ _ __  __   _| || | | |
//  | |    | | '_ \| |/ / _ \/ _` | | | | '_ \   \___ \ / __| '__/ _` | '_ \ / _ \ '__| \ \ / / || | | |
//  | |____| | | | |   <  __/ (_| |_| |_| | | |  ____) | (__| | | (_| | |_) |  __/ |     \ V /| || |_| |
//  |______|_|_| |_|_|\_\___|\__,_|_____|_| |_| |_____/ \___|_|  \__,_| .__/ \___|_|      \_/ |_(_)___/ 
//                                                                    | |                               
//                                                                    |_|                               

/*
 * User: Luke Wilson
 * Date: 15th Feb 2024
 * Time: 16:37
 * 
 * Please note: this extension relies on a paid-for RapidAPI library: https://rapidapi.com/williambarberjr/api/linkedin-company-data
*/

var scriptVersion = "1.0";
var scriptLastUpdated = "11th March 2024";
var debug = false; //set to TRUE to see additional console logging
var testingLimit = 100; //How many URLs to scrape in a debug run

//If you have your own account/API key, enter it here.
var API_KEY = "73573a18a2mshe980fd75c59e7a9p156a25jsn537c521b7101";
var API_HOST = "linkedin-company-data.p.rapidapi.com";

////////////////////////////////////////
///////////// FUCNTIONS// /////////////
///////////////////////////////////////

async function getJobOpenings(liURL) {

}

function getFieldTypeOptions(fieldType) {
  switch (fieldType) {
    case 'singleLineText':
    case 'multilineText':
    case 'email':
    case 'url':
    case 'singleCollaborator':
    case 'multipleCollaborators':
    case 'phoneNumber':
    case 'richText':
    case 'barcode':
    case 'multipleAttachments':
      return null
    case 'multipleRecordLinks':
      return { linkedTableId: null }
    case 'duration':
      return { durationFormat: 'h:mm:ss' }
    case 'number':
      return { precision: 0 }
    case 'float':
      return { precision: 2 }
    case 'percent':
      return { precision: 5 }
    case 'currency':
      return { precision: 2, symbol: "$" }
    case 'singleSelect':
    case 'multipleSelects':
      return { choices: [{ name: " " }] }
    case 'date':
      return { dateFormat: { name: 'friendly', format: 'LL' } }
    case 'dateTime':
      return { dateFormat: { name: 'friendly', format: 'LL' }, timeFormat: { name: '24hour', format: 'HH:mm' }, timeZone: 'utc' }
    case 'checkbox':
      return { icon: 'check', color: 'greenBright' }
    case 'rating':
      return { icon: 'star', max: 5, color: 'yellowBright' }
    default:
      throw new Error(`Unexpected field type ${fieldType}`)
  }
}

async function createMissingFields(table, tableType) {
  // Retrieve the existing fields in the table
  const existingFields = await table.fields;

  // Map the existing fields to an object for easier comparison
  const existingFieldMap = {};
  for (const field of existingFields) {
    existingFieldMap[field.name] = field;
  }

  if (tableType == "pages") {
    var fieldDefinitions = fieldDefinitions_pages;
    var fieldTypeOpts = { linkedTableId: tablePosts.id }
  }
  if (tableType == "posts") {
    var fieldDefinitions = fieldDefinitions_posts;
    var fieldTypeOpts = { linkedTableId: tablePages.id }
  }

  // Loop through the field definitions and create any missing fields
  for (const fieldDefinition of fieldDefinitions) {
    const { name, type, description } = fieldDefinition;

    // Check if the field already exists in the table
    if (!existingFieldMap[name]) {

      //Special for Hilton base
      if (base.name === "Hilton") {
        if (name == "Sub Brand") {
          let table = base.getTable("tblv94BG1WHpMt3vs"); //Competitors - Case Studies
          fieldTypeOpts = { linkedTableId: table.id }
        }
      }

      // If not, create the field
      if (type == "multipleRecordLinks" && (name == "LinkedIn Post" || name == "LinkedIn Page" || name == "Sub Brand")) {
        await table.createFieldAsync(name, type, fieldTypeOpts, description);
      } else if (type == "number" && (name == "Average Post likes" || name == "Average Post/Year" || name == "Average Post/Month")) {
        await table.createFieldAsync(name, type, { precision: 2 }, description);
      } else {
        await table.createFieldAsync(name, type, getFieldTypeOptions(type), description);
      }
    }
  }
}

async function createSelectOptions(table, tableType) {

  //Options for the Posts table
  if (tableType == "posts") {
    //Add Single and Multi Select default options to the table
    const postTypeField = table.getField("Post Type");
    //Only run this if the preset options don't exist
    if (postTypeField.options.choices.length < 5) {
      await postTypeField.updateOptionsAsync({
        choices: [
          ...postTypeField.options.choices,
          { name: "Video", color: "blueLight2" },
          { name: "Image", color: "cyanLight2" },
          { name: "Article", color: "tealLight2" },
          { name: "Document", color: "greenLight2" },
          { name: "Text", color: "yellowLight2" },
        ],
      });
    }
  }

  //Options for the Pages table
  if (tableType == "pages") {
    //Add Single and Multi Select default options to the table
    const pageRegionField = table.getField("Region");
    //Only run this if the preset options don't exist
    if (pageRegionField.options.choices.length < 4) {
      await pageRegionField.updateOptionsAsync({
        choices: [
          ...pageRegionField.options.choices,
          { name: "EMEA", color: "blueLight2" }, //Europe/Middle East
          { name: "AMER", color: "cyanLight2" }, //Americas
          { name: "APAC", color: "tealLight2" }, //Asia-Pacific
          //{ name: "GLOBAL", color: "greenLight2" },
        ],
      });
    }

    //Add Single and Multi Select default options to the table
    const pageCountryField = table.getField("Country");
    //Only run this if the preset options don't exist
    if (pageCountryField.options.choices.length < 76) {
      await pageCountryField.updateOptionsAsync({
        choices: [
          ...pageCountryField.options.choices,
          { name: "Albania", color: selectRandomColour() },
          { name: "Argentina", color: selectRandomColour() },
          { name: "Armenia", color: selectRandomColour() },
          { name: "Aruba", color: selectRandomColour() },
          { name: "Australia", color: selectRandomColour() },
          { name: "Azerbaijan", color: selectRandomColour() },
          { name: "Barbados", color: selectRandomColour() },
          { name: "Belarus", color: selectRandomColour() },
          { name: "Belgium", color: selectRandomColour() },
          { name: "Bolivia (Plurinational State of)", color: selectRandomColour() },
          { name: "Brazil", color: selectRandomColour() },
          { name: "Bulgaria", color: selectRandomColour() },
          { name: "Canada", color: selectRandomColour() },
          { name: "China", color: selectRandomColour() },
          { name: "Congo (Democratic Republic of the)", color: selectRandomColour() },
          { name: "Costa Rica", color: selectRandomColour() },
          { name: "Croatia", color: selectRandomColour() },
          { name: "Cyprus", color: selectRandomColour() },
          { name: "Egypt", color: selectRandomColour() },
          { name: "Ethiopia", color: selectRandomColour() },
          { name: "France", color: selectRandomColour() },
          { name: "French Polynesia", color: selectRandomColour() },
          { name: "Germany", color: selectRandomColour() },
          { name: "GLOBAL", color: selectRandomColour() },
          { name: "Guatemala", color: selectRandomColour() },
          { name: "Honduras", color: selectRandomColour() },
          { name: "Hungary", color: selectRandomColour() },
          { name: "India", color: selectRandomColour() },
          { name: "Indonesia", color: selectRandomColour() },
          { name: "Ireland", color: selectRandomColour() },
          { name: "Israel", color: selectRandomColour() },
          { name: "Italy", color: selectRandomColour() },
          { name: "Kenya", color: selectRandomColour() },
          { name: "Korea (Republic of)", color: selectRandomColour() },
          { name: "Latvia", color: selectRandomColour() },
          { name: "Lebanon", color: selectRandomColour() },
          { name: "Lithuania", color: selectRandomColour() },
          { name: "Luxembourg", color: selectRandomColour() },
          { name: "Macedonia (the former Yugoslav Republic of)", color: selectRandomColour() },
          { name: "Maldives", color: selectRandomColour() },
          { name: "Mauritius", color: selectRandomColour() },
          { name: "Mexico", color: selectRandomColour() },
          { name: "Morocco", color: selectRandomColour() },
          { name: "Myanmar", color: selectRandomColour() },
          { name: "Netherlands", color: selectRandomColour() },
          { name: "New Zealand", color: selectRandomColour() },
          { name: "Nigeria", color: selectRandomColour() },
          { name: "Oman", color: selectRandomColour() },
          { name: "Panama", color: selectRandomColour() },
          { name: "Peru", color: selectRandomColour() },
          { name: "Philippines", color: selectRandomColour() },
          { name: "Poland", color: selectRandomColour() },
          { name: "Puerto Rico", color: selectRandomColour() },
          { name: "Qatar", color: selectRandomColour() },
          { name: "Romania", color: selectRandomColour() },
          { name: "Russian Federation", color: selectRandomColour() },
          { name: "Saudi Arabia", color: selectRandomColour() },
          { name: "Serbia", color: selectRandomColour() },
          { name: "Seychelles", color: selectRandomColour() },
          { name: "Slovakia", color: selectRandomColour() },
          { name: "South Africa", color: selectRandomColour() },
          { name: "Spain", color: selectRandomColour() },
          { name: "Sri Lanka", color: selectRandomColour() },
          { name: "Sweden", color: selectRandomColour() },
          { name: "Switzerland", color: selectRandomColour() },
          { name: "Taiwan", color: selectRandomColour() },
          { name: "Tanzania", color: selectRandomColour() },
          { name: "Thailand", color: selectRandomColour() },
          { name: "Turkey", color: selectRandomColour() },
          { name: "Ukraine", color: selectRandomColour() },
          { name: "United Arab Emirates", color: selectRandomColour() },
          { name: "United Kingdom of Great Britain and Northern Ireland", color: selectRandomColour() },
          { name: "United States of America", color: selectRandomColour() },
          { name: "Uruguay", color: selectRandomColour() },
          { name: "Uzbekistan", color: selectRandomColour() },
          { name: "Zambia", color: selectRandomColour() },
        ],
      });
    }
  }

  return false;

}

function selectRandomColour() {
  const options = ["blueLight2", "cyanLight2", "tealLight2", "greenLight2", "yellowLight2", "orangeLight2", "redLight2", "pinkLight2", "purpleLight2", "grayLight2"];
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}

function convertTagsArray(tags) {

  //Filter out any duplicate tags so it doesn't break the Airtable row update
  const uniqueTagsArray = [...new Set(tags)];

  //Remap tags to the select object format, with a randomly selected colour
  const newTagsArray = uniqueTagsArray.map((name) => {
    return { name: name };
  });

  return newTagsArray;
}

async function generateTagChoices(table, fieldName, tags) {
  // Ensure that tags is an array, and provide an empty array if it's undefined
  const tagsArray = Array.isArray(tags) ? tags : [];

  // Filter out any duplicate tags from the new tags array
  const uniqueNewTagsArray = tagsArray.filter((tag, index, self) => self.indexOf(tag) === index);

  // Remap new tags to the select object format, with a randomly selected colour
  const newTagsArray = uniqueNewTagsArray.map((name) => {
    return { name: name.trim(), color: selectRandomColour() };
  });

  // Add Single and Multi Select default options to the table
  const tagsField = table.getField(fieldName);

  // Ensure `tagsField.options.choices` is initialized
  const existingChoices = tagsField.options.choices || [];

  // Calculate the remaining available slots for new tags
  const remainingSlots = Math.max(0, 10000 - existingChoices.length);

  // Take only the allowed number of new tags
  const newTagsWithoutDuplicates = newTagsArray.slice(0, remainingSlots);

  // Update options only if there are new tags to add
  if (newTagsWithoutDuplicates.length > 0) {
    await tagsField.updateOptionsAsync({
      choices: [
        ...existingChoices,
        ...newTagsWithoutDuplicates
      ],
    });
  } else {
    if (debug) {
      console.log("No new tags added. Field limit reached (10,000).");
    }
  }
}


const parseRelativeTimestamp = (timestamp) => {
  if (timestamp && typeof timestamp === 'string') {
    const now = new Date();

    if (timestamp.includes('h')) {
      // If it's in hours
      const hoursAgo = parseInt(timestamp, 10);
      return new Date(now - hoursAgo * 60 * 60 * 1000).toISOString();
    } else if (timestamp.includes('d')) {
      // If it's in days
      const daysAgo = parseInt(timestamp, 10);
      return new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    } else if (timestamp.includes('w')) {
      // If it's in weeks
      const weeksAgo = parseInt(timestamp, 10);
      return new Date(now - weeksAgo * 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (timestamp.includes('mo')) {
      // If it's in months
      const monthsAgo = parseInt(timestamp, 10);
      return new Date(now - monthsAgo * 30 * 24 * 60 * 60 * 1000).toISOString(); // Assuming 30 days per month
    } else if (timestamp.includes('y')) {
      // If it's in years
      const yearsAgo = parseInt(timestamp, 10);
      return new Date(now - yearsAgo * 365.25 * 24 * 60 * 60 * 1000).toISOString(); // Accounting for leap years
    } else {
      // Handle other formats or unknown formats as needed
      return "";
    }
  } else {
    // Handle the case where timestamp is null or not a string
    return "";
  }
};

// Posting Cadence
function calculatePostingCadence(isoTimestamps) {
  // Convert ISO timestamps to Date objects
  const postDates = isoTimestamps.map(timestamp => new Date(timestamp));

  // Sort the dates in ascending order
  postDates.sort((a, b) => a - b);

  // Calculate the time difference in milliseconds between each consecutive post
  const timeDifferences = [];
  for (let i = 1; i < postDates.length; i++) {
    const diff = postDates[i] - postDates[i - 1];
    timeDifferences.push(diff);
  }

  // Calculate the average time difference
  const averageTimeDifference = timeDifferences.reduce((sum, diff) => sum + diff, 0) / timeDifferences.length;

  // Calculate posts per year and posts per month
  const millisecondsInYear = 365.25 * 24 * 60 * 60 * 1000; // accounting for leap years
  const millisecondsInMonth = 30.44 * 24 * 60 * 60 * 1000; // average days in a month

  const postsPerYear = 1 / (averageTimeDifference / millisecondsInYear);
  const postsPerMonth = 1 / (averageTimeDifference / millisecondsInMonth);

  return {
    postsPerYear: postsPerYear.toFixed(2),
    postsPerMonth: postsPerMonth.toFixed(2),
  };
}

////////////////////////////////////////
///////////// TABLE SETUP /////////////
///////////////////////////////////////

//Table for Page posts
//Required table setup
const fieldDefinitions_posts = [
  { name: 'Post Link', type: 'url' },
  { name: 'Page Name', type: 'singleLineText' },
  { name: 'Posting Date', type: 'date' },
  { name: 'Post Type', type: 'singleSelect' },
  { name: 'Post Copy', type: 'multilineText' },
  { name: 'Comments', type: 'number' },
  { name: 'Reactions', type: 'number' },
  { name: 'Hashtags', type: 'multipleSelects' },
  { name: 'Post Media', type: 'multipleAttachments' },
  //{ name: 'Last Activity', type: 'date' },
  { name: 'LinkedIn Page', type: 'multipleRecordLinks' }, //ID of the Page table (linkedTableId: TableId)
  { name: 'Average Post/Month', type: 'singleLineText', description: 'Needs to be manually switched to a Lookup field' }, //these can't be created in the proper `multipleLookupValues` format progmatically
  { name: 'Average Post/Year', type: 'singleLineText', description: 'Needs to be manually switched to a Lookup field' }, //these can't be created in the proper `multipleLookupValues` format progmatically
  { name: 'Main Brand', type: 'singleLineText', description: 'Needs to be manually switched to a Lookup field' },
];

//Table for page data
const fieldDefinitions_pages = [
  { name: 'URL', type: 'url' },
  { name: 'Company Name', type: 'singleLineText' },
  { name: 'Sub Brand', type: 'multipleRecordLinks' },
  { name: 'Main Brand', type: 'singleLineText', description: 'Needs to be manually switched to a Lookup field' },
  { name: 'Associated Local Pages', type: 'singleLineText' },
  { name: 'URL Inactive/Channel Unavailable', type: 'checkbox' },
  { name: 'Country', type: 'singleSelect' },
  { name: 'Region', type: 'singleSelect' },
  { name: 'Page Created', type: 'date' },
  { name: 'Last Activity', type: 'date' },
  { name: 'Followers', type: 'number' },
  { name: 'Employees', type: 'number' },
  { name: 'Associated Members', type: 'number' },
  { name: 'Job Openings', type: 'number' },
  { name: 'Total Posts', type: 'number' },
  { name: 'Recent <10 posts - Total Performance', type: 'number' },
  { name: 'Average Post likes', type: 'number', precision: 2 },
  { name: 'Average Post/Year', type: 'number', precision: 2 },
  { name: 'Average Post/Month', type: 'number', precision: 2 },
  { name: 'LinkedIn Post', type: 'multipleRecordLinks' }, //ID of the Posts table (linkedTableId: TableId)
  { name: 'Company ID', type: 'number' },
];


////////////////////////////////////////
////////////// INTERFACE //////////////
//////////////////////////////////////

output.markdown(`## LinkedIn Company Profile Scraper v1.0`);

output.markdown(`User Guide: [How to use the LinkedIn Scraper extension](https://stormideas.atlassian.net/wiki/x/mwBI8) | Last updated: ${scriptLastUpdated}`)

const addTableOrField = await input.buttonsAsync('Do you want to create a new table or add data to an existing table?', [
  { label: 'Create new table', value: 'table', variant: 'primary' },
  { label: 'Add fields to existing table', value: 'fields', variant: 'primary' },
]);

if (addTableOrField === 'table') {
  const tableName = await input.textAsync('Name of table to create (two tables will be created from this for Pages and Posts data)');

  //Set table name vars
  var tablePagesName = tableName + " (Pages)";
  var tablePostsName = tableName + " (Posts)";

  output.markdown(`**Created tables "${tablePagesName}" & "${tablePostsName}"**`);

  //Create Pages Table
  let tableId_pages = await base.createTableAsync(tablePagesName, [
    { name: "URL", type: "url", options: getFieldTypeOptions("url"), description: 'Automatically created by LinkedIn Company Profile Scraper v' + scriptVersion }
  ]);
  //Create Posts Table
  let tableId_posts = await base.createTableAsync(tablePostsName, [
    { name: "Post Link", type: "url", options: getFieldTypeOptions("url"), description: 'Automatically created by LinkedIn Company Profile Scraper v' + scriptVersion }
  ]);

  //Get tables
  var tablePages = base.getTable(tablePagesName);
  var tablePosts = base.getTable(tablePostsName);

  output.markdown(`Creating **${tablePagesName}** table fields...`);

  //Pages Table
  await createMissingFields(tablePages, "pages")
    .then(() => {
      createSelectOptions(tablePages, "pages");
      output.markdown(`**${tablePagesName}** Fields created successfully!`);
    })
  // .catch((error) => {
  //   console.error('Error creating table fields!');
  // });
  //Add default Single/Multi select options to the table
  const fldsPages = tablePages.fields.filter(f => f.options?.choices)
  //await createSelectOptions(tablePages, "pages");


  output.markdown(`Creating **${tablePostsName}** table fields...`);

  //Posts Table
  await createMissingFields(tablePosts, "posts")
    .then(() => {
      output.markdown(`**${tablePostsName}** Fields created successfully!`);
    })
    .catch((error) => {
      console.error('Error creating table fields!');
    });
  //Add default Single/Multi select options to the table
  const fldsPosts = tablePosts.fields.filter(f => f.options?.choices)
  await createSelectOptions(tablePosts, "posts");


} else {
  //Add to Page Data table
  var tablePages = await input.tableAsync('Which table do you want to add PAGE DATA to?');
  let tablePagesName = base.getTable(tablePages.id);

  //Add to Post Data table
  var tablePosts = await input.tableAsync('Which table do you want to add POST DATA to?');
  let tablePostsName = base.getTable(tablePosts.id);

  //Update PAGES table
  await createMissingFields(tablePagesName, "pages")
    .then(() => {
      output.markdown('Page Data fields created successfully!');
    })
    .catch((error) => {
      console.error('Error creating missing Page Data fields:', error.name);
    });
  //Add default Single/Multi select options to the table
  await createSelectOptions(tablePages, "pages");

  //Update POSTS table
  await createMissingFields(tablePostsName, "posts")
    .then(() => {
      output.markdown('Posts Data fields created successfully!');
    })
    .catch((error) => {
      console.error('Error creating missing Posts Data fields:', error.name);
    });
  //Add default Single/Multi select options to the table
  await createSelectOptions(tablePosts, "posts");
}

//Choose scraping options
let how2scrape = await input.buttonsAsync(
  'How would you like to scrape the LinkedIn data?',
  [
    { label: 'Manually Input URL(s)', value: 'manual', variant: 'primary' },
    { label: 'Lookup URL Field in a Table', value: 'table', variant: 'primary' },
  ],
);

var liArray = [];
if (how2scrape === 'manual') {
  // User inputted URLs
  var scrapeURLs = await input.textAsync('Enter LinkedIn URLs, comma separated');

} else {

  // prompt the user to pick a table, then show the number of records in that table:
  let tableSelect = await input.tableAsync('Select the REFERENCE table');
  output.markdown(`Selected reference table: **${tableSelect.name}**.`);

  let selectURLfield = await input.fieldAsync("Select URL Field", tableSelect.name);
  output.markdown(`You picked the **${selectURLfield.name}** field.`);

  let selectView = await input.viewAsync("Select View", tableSelect.name);
  output.markdown(`You picked the **${selectView.name}** view.`);

  output.markdown(`---`);
  output.markdown(`## Scraping data, please wait...`);

  // query for all the records in a table 
  let table = base.getTable(tableSelect.name);
  let queryResult = await selectView.selectRecordsAsync({
    fields: [selectURLfield.name],
    sorts: [
      { field: selectURLfield.name, direction: "asc" }
    ]
  });

  // Create the URL array from the table fields
  let regex = new RegExp(/\/(\d+)$/);
  var t = 0;
  var d = 0;
  for (let record of queryResult.records) {

    var currentUrl = record.getCellValueAsString(selectURLfield.name);
    // Use regex to check if the URL ends with only digits
    let match = regex.exec(currentUrl);

    if (match) {
      // If it matches, the result will be in match[1]
      let digits = match[1];
      var idData = JSON.stringify({ li_ids: [digits] });

      const url = 'https://linkedin-company-data.p.rapidapi.com/linkedInCompanyDataById';
      const options = {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': API_HOST
        },
        body: idData
      };

      try {
        const response = await fetch(url, options);
        const result = await response.json();
        //Replace currentUrl with the actual LinkedIn URL from the ID redirect
        currentUrl = result.companies[0].final_li_url;
      } catch (error) {
        console.error(`Error parsing "linkedInCompanyDataById" API (${error.name})
        Failed on: ${currentUrl} (possible reasons: Page no longer exists or API rate limit hit. Try submitting these URLs manually.`);
      }
      d++;
    }

    // Push all URLs into an array for the next API call
    liArray.push(currentUrl)
    t++;
    // For testing
    if (t > testingLimit && debug) { break; }
  }
} //end else

output.markdown(`Finished looking up URLs to scrape!`);
if (d > 0) {
  output.markdown(`Converted **${d}** company IDs to full URLs.`);
}
if (debug) {
  output.markdown(`---`);
  output.markdown(`**Debugging liArray:**`);
  console.info(liArray);
  output.markdown(`**Debugging Company IDs:**`);
  console.info(idData);
}

//console.dir(liArray)

if (how2scrape === 'manual') {
  // Split the string into an array using the comma as a delimiter
  var arrayURLs = scrapeURLs.split(',');
  // Trim each element of the array
  var liArray = arrayURLs.map(liURL => liURL.trim());
}

// Case-insensitive matching for "/in/" in a URL meaning 
//  it's a personal profile, not a company, plus some other niche page types
const exclusionPattern = /\/(in|sharing|showcase)\//i;
let filteredCount = 0;
let excludedArray = [];

// Filtering the array based on the pattern
//const filteredLiArray = liArray.filter(element => !exclusionPattern.test(element));
const filteredLiArray = liArray.filter(element => {
  if (exclusionPattern.test(element)) {
    filteredCount++;
    excludedArray.push(element)
    return false; // Exclude this element
  }
  return true; // Include this element
});

// Replacing "http://" with "https://www." in the filtered array
const modifiedLiArray = filteredLiArray.map(element => element.replace(/^http:\/\//, 'https://www.'));

// Check for any URLs with localisation subdomains (breaks the API)
const modifiedLiArrayAgain = modifiedLiArray.map(element => element.replace(/(\.[a-z]{2}\.)/, '.'));

// Stringify the data first
const postData = JSON.stringify({ liUrls: modifiedLiArrayAgain });

if (filteredCount > 0) {
  output.markdown(`⚠️ Skipped **${filteredCount}** invalid URLs (personal profiles etc.)`);
}

if (debug) {
  output.markdown(`---`);
  output.markdown(`**Debugging excludedArray:**`);
  console.info(excludedArray)
  output.markdown(`**Debugging modifiedLiArrayAgain:**`);
  console.info(modifiedLiArrayAgain);
}


// Post to LI via RapidAPI
const url = 'https://linkedin-company-data.p.rapidapi.com/linkedInCompanyDataJson';
const options = {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': API_HOST
  },
  body: postData
};

// Run the API
const response = await fetch(url, options);
if (response.ok) {
  const results = await response.json();

  if (debug) {
    output.markdown(`---`);
    output.markdown(`**Debugging API result**`);
    console.info(results)
    output.markdown(`**Debugging postData**`);
    console.info(postData)
  }

  // Technical success, but empty array
  if (!results.results) {
    console.error(`Error getting results (Status code: ${results.status_code})!
    ${results.message}`);
    console.dir(modifiedLiArrayAgain);
  } else {

    // Success!
    if (results.status_code === 200) {

      output.markdown(`### Adding data to Airtable...`);

      if (results && results.results && Array.isArray(results.results)) {
        var i = 0; //count pages
        var x = 0; //count posts
        for (const result of results.results) {
          // Reset variables
          let companyPosts = 0;
          let companyUpdates = [];
          let postTimeDescriptions = [];
          let companyID = result.company_id;
          let companyLink = result.final_li_url;
          let companyName = result.company_name;
          let companyEmployees = result.employee_count_on_li;
          //let companyHQ = result.headquarters.country; //eg: US
          let employeesOnLI = result.employees_on_li?.length;
          if (result.follower_count) {
            var companyFollowers = result.follower_count.toLocaleString();
            var companyFollowersRAW = result.follower_count;
          }
          // Get job openings
          const postData = JSON.stringify({ liUrl: companyLink });

          const url = 'https://linkedin-company-data.p.rapidapi.com/getJobOpenings';
          const options = {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'X-RapidAPI-Key': API_KEY,
              'X-RapidAPI-Host': API_HOST
            },
            body: postData
          };
          // Run the API
          try {
            const response = await fetch(url, options);
            if (response.ok) {
              const jsonResult = await response.json();
              // Technical success, but empty array
              if (jsonResult.message !== "Success") {
                //console.error(`Error: No job openings found!`);
                var jobOpenings = 0;
              } else {
                // Success!
                var jobOpenings = jsonResult.results.jobOpeningsCount;
              }
            }
          } catch (error) {
            if (debug) {
              //Usually happens when there are no job postings on a page
              console.error(`Error parsing "getJobOpenings" API (${error.name})
            Failed on: ${companyLink}`);
            }
            var jobOpenings = 0;
          }

          var lastActivity = "";
          // Loop page updates if exist
          if (result.updates) {

            if (debug) {
              output.markdown(`📝 Company updates for: **${companyLink}**`);
              console.info(result.updates);
            }

            // Get latest activity
            var companyUpdatesActivity = null;

            if (result.updates[0]?.date) {
              companyUpdatesActivity = result.updates[0].date;
            } else if (result.updates[0]?.nestedPost?.date) {
              companyUpdatesActivity = result.updates[0].nestedPost.date; // reposts
            }

            lastActivity = parseRelativeTimestamp(companyUpdatesActivity);

            companyPosts = result.updates.length;
            companyUpdates = result.updates;

            // Extract reactions values into an array
            const reactionsArray = companyUpdates.map(update => update.reactions);
            // Calculate the sum of reactions
            var totalReactions = reactionsArray.reduce((sum, reactions) => sum + reactions, 0);
            // Calculate the average reactions
            var averageReactions = totalReactions / companyUpdates.length;

            // Create array of the relative timestamps (eg: 3d, 1mo)
            for (const update of companyUpdates) {

              if (Object.keys(update).length === 0 && update.constructor === Object) {
                if (debug) {
                  console.error("Empty object found in companyUpdates");
                }
                continue;  // Skip to the next iteration
              }

              if (update.date) {
                postTimeDescriptions.push(update.date);
              } else if (update.nestedPost && update.nestedPost.date) {
                // Check if the date property is nested inside nestedPost
                postTimeDescriptions.push(update.nestedPost.date); //reposts
              }

            }

          }
          // Convert relative timestamps to ISO date strings
          const postTimestampsISO = postTimeDescriptions.map(parseRelativeTimestamp);
          // Calculate posting cadence
          var cadence = calculatePostingCadence(postTimestampsISO);

          //output.markdown(`**[${companyName}](${companyLink})** company data added!`);
          // output.markdown(`**Profile:** <${companyLink}>`);
          // output.markdown(`**Follower Count:** ${companyFollowers}`);
          // output.markdown(`**Job Openings:** ${jobOpenings}`);
          // output.markdown(`**Employees:** ${companyEmployees}`);
          // output.markdown(`**Company Posts:** ${companyPosts}`);
          // output.markdown(`**Average Posts per Year:** ${cadence.postsPerYear}`);
          // output.markdown(`**Average Posts per Month:** ${cadence.postsPerMonth}`);
          // output.markdown(`**Average Post Reactions:** ${averageReactions}`);
          // output.markdown(`---`);

          //Finally, create all the records in the PAGE DATA AirTable :)
          var recordIds = await tablePages.createRecordAsync({
            'URL': companyLink,
            'Company Name': companyName,
            //'Country': companyHQ,
            // 'Region': {},
            'Last Activity': lastActivity,
            'Followers': companyFollowersRAW,
            'Employees': companyEmployees,
            'Associated Members': employeesOnLI,
            'Job Openings': jobOpenings,
            'Total Posts': companyPosts,
            'Recent <10 posts - Total Performance': totalReactions,
            'Average Post likes': parseFloat(averageReactions),
            'Average Post/Year': parseFloat(cadence.postsPerYear),
            'Average Post/Month': parseFloat(cadence.postsPerMonth),
            'Company ID': companyID,
          });

          // ...and then add the relevant data to the POST DATA table!
          var postingDate = [];
          for (const update of companyUpdates) {
            let postText = update.postText;

            if (Object.keys(update).length === 0 && update.constructor === Object) {
              if (debug) {
                console.error("Empty object found in companyUpdates");
              }
              continue;  // Skip to the next iteration
            }

            // Convert relative timestamps to ISO date strings
            if (update.date) {
              var postDate = parseRelativeTimestamp(update.date);
            } else if (update.nestedPost && update.nestedPost.date) {
              // Check if the date property is nested inside nestedPost
              var postDate = parseRelativeTimestamp(update.nestedPost.date);
            }

            let postComments = update.comments;
            let postReactions = update.reactions;
            let postType = "Text";
            //Check for post media
            var mediaArray = [];
            if (Array.isArray(update.media) && update.media) {
              let postMedia = update.media;
              postType = "Image";
              for (const media of postMedia) {
                mediaArray.push({ url: media });
              }
            }
            //Check for links
            if (update.linksInPostText && typeof update.linksInPostText === 'object') {
              //Check for hashtags
              if (Array.isArray(update.linksInPostText.hashtagLinks) && update.linksInPostText.hashtagLinks) {
                let postHashtags = update.linksInPostText.hashtagLinks;
                var hashtagArray = [];
                for (const hashtag of postHashtags) {
                  const match = hashtag.match(/\w+$/);
                  if (match) {
                    const extractedValue = match[0];
                    hashtagArray.push(extractedValue);
                  }
                }
                // Use Set to remove duplicate entries
                hashtagArray = Array.from(new Set(hashtagArray));
              }
            }

            //Add hashtags to posts
            //Convert tags into multiselect choices
            let newTags = await generateTagChoices(tablePosts, "Hashtags", hashtagArray);
            //Update tags array to the correct format for Airtable
            let convertedTags = convertTagsArray(hashtagArray);

            var recordPostIds = await tablePosts.createRecordAsync({
              'Post Link': companyLink + '/posts/?feedView=all',
              'Page Name': companyName,
              'Posting Date': postDate,
              'Post Type': { name: postType },
              'Post Copy': postText,
              'Comments': postComments,
              'Reactions': postReactions,
              'Hashtags': convertedTags,
              'Post Media': mediaArray,
              //'Last Activity': lastActivity,
              //'LinkedIn Page': recordIds, // can't be updated via script
            });

            //Link Posts back to the Parent Page
            let newPageRecordID = recordIds;
            await tablePosts.updateRecordAsync(recordPostIds, {
              'LinkedIn Page': [
                //...recordPostIds.getCellValue('LinkedIn Page'),
                { id: newPageRecordID }
              ]
            });

            //Link Pages back to the Posts
            // let queryResult = await tablePages.selectRecordsAsync({ fields: ["LinkedIn Post"] });
            // let record = queryResult.getRecord(queryResult.recordIds[0]);

            // let newPostRecordID = recordPostIds;
            // await tablePages.updateRecordAsync(recordIds, {
            //   'LinkedIn Post': [
            //     ...record.getCellValue('LinkedIn Post'),
            //     { id: newPostRecordID }
            //   ]
            // });

            x++;
          }

          if (!companyName) {
            output.markdown(`⚠️ No data found for: **${result.final_li_url}**`)
            if (debug) {
              console.dir(result);
            }
          }
          i++;
        }
        output.markdown(`---`);
        output.markdown(`## Results`);
        output.markdown(`**${i}** company page data added!`);
        output.markdown(`**${x}** company posts added!`);
      } else {
        console.error("Invalid or missing 'results' property in the response");
      }
    } else {
      //Uh oh...
      console.error(`Error: ${results.message} (${results.status_code})`);
    }
  }
} else {
  console.error("Request failed with status:", response.status);
}
