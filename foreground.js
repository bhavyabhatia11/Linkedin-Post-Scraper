console.log("foreground injected"); 

var db = [];
var postsLength = 0;
var postsToScan = 0
var myInfinity = 10000000000;
var userNames = [];
var userLinks = [];
var userBios = [];
var posts = [];
var hashTags = [];

chrome.storage.local.get('postsCount', function (result) {
  postsToScan = result['postsCount'];
  scrollBottom(postsToScan);
});

function extractHashtags(text) {
    const hashtags = [];
  
    // Split the text into words
    const words = text.split(' ');
  
    // Iterate over each word
    for (const word of words) {
      // Check if the word starts with a hashtag
      if (word[0] === '#') {
        // Remove the hashtag symbol from the word
        const hashtag = word.substring(1);
        // Add the hashtag to the list
        hashtags.push(hashtag);
      }
    }
  
    return hashtags;
  }
function generateData (postsAmount) {
    // users
	var user = document.evaluate("//a[@class='app-aware-link  update-components-actor__container-link relative display-flex flex-grow-1']", document, null, XPathResult.ANY_TYPE, null);
	var iterator = user.iterateNext();

	while(iterator) {
		userLinks.push(iterator.href);

        var userName = iterator.getElementsByClassName("update-components-actor__name")?.[0]?.outerText.split("\n")[0]
        userNames.push(userName)

        var userBio = iterator.getElementsByClassName("update-components-actor__description")?.[0]?.outerText.split("\n")[0]
        userBios.push(userBio)

		iterator = user.iterateNext();
	}
    // post
	var post = document.evaluate("//div[@class='feed-shared-update-v2__description-wrapper']", document, null, XPathResult.ANY_TYPE, null);
	iterator = post.iterateNext();

	while (iterator) {
        var postText = iterator.getElementsByClassName("break-words")?.[0]?.outerText
        var hashTag = extractHashtags(postText)

		posts.push(postText);
        hashTags.push(hashTag);

		iterator = post.iterateNext();
	}
}

function downloadCSV(data) {

  // Extract keys from first object in array to use as column headings
  const keys = Object.keys(data[0]);
  
  // Create CSV header row and append to CSV data
  let csvData = keys.map(key => `"${key}"`).join(",") + "\n";
  
  // Loop through data array and append each row to CSV data
  for (let row of data) {
    const values = keys.map(key => {
      let value = row[key].toString();
      // Handle cases where field contains commas or quotes by enclosing field in double-quotes and escaping existing double-quotes
      if (typeof value === "string") {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvData += values.join(",") + "\n";
  }
  
  // Create a blob object of the CSV data and create a URL for the blob
  const blob = new Blob([csvData], {type: "text/csv"});
  const url = URL.createObjectURL(blob);
  
  // Create link element with download attribute and set href to URL of blob
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "data.csv");
  
  // Simulate click on link element to download CSV file
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  chrome.runtime.sendMessage({type: "download_complete"});

}


function startScraping(postsAmount) {
	
    generateData(postsAmount);
    for(var i = 0; i < postsAmount; i++) {
		var item = {"User Name": userNames[i], "User Bio": userBios[i], "User Link": userLinks[i], "Post": posts[i], "Hash Tags": hashTags[i]};
		db.push(item);
	};

	// var json_text = JSON.stringify(db, null, 2);
  downloadCSV(db);
}


function scrollBottom(postsAmount) {
	setTimeout(function timeOut() {
		postsLength = document.getElementsByClassName("feed-shared-update-v2__description-wrapper").length
		if (postsLength < postsAmount) {
            window.scrollBy(0, 500);
			scrollBottom(postsAmount);
		}
		else {
			startScraping(postsAmount);		
		}

	}, 100);
}

  