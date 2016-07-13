/**
 * Project 2: Feedr
 * ====
 *
 * See the README.md for instructions
 */

(function() {

  var redditTopic = 'curry';
  var redditTopicURL = `https://www.reddit.com/api/subreddits_by_topic.json?query=${redditTopic}`;

  var container = document.querySelector('#container')
  var header = document.querySelector('header');
  var modal = document.querySelector('.modal-container');
  var state = {
  }

  renderLoading(state, container)

  function renderLoading(data, into) {
    into.innerHTML = `
    <div id="pop-up" class="loader">
    </div>
    `
  }

  // Get Topics for Menu
  fetch(redditTopicURL).then(function(response) {
      return response.json();
  }).then(function(json) {
    state.categories = json
    renderHeader(state, header);
    getSubReddit(state.categories[0].name)
    document.querySelector('ul.outer li span').innerHTML = state.categories[0].name
  })

  // Setup delegate event handler on the dropdown menu
  delegate('header', 'click', 'ul.dropdown li a', function(event){
    var topic = stripHash(event.delegateTarget.getAttribute('href'));
    getSubReddit(topic);
    document.querySelector('ul.outer li span').innerHTML = topic
  })

  //Strip Hash From Url Function
  function stripHash(url) {
    return url.split('#')[1];
  }

  // Get Content from reddit for the clicked category
  function getSubReddit(url) {

    renderLoading(state, container)

    fetch('https://www.reddit.com/r/' + url + '.json?limit=5').then(function(response) {
      return response.json();
    }).then(function(json) {

      var items = json.data.children

      var newfoo = items.map(function(obj,index){
        var object = {}

        object.title = obj.data.title

        if (obj.data.preview !== undefined) {
          object.image = obj.data.preview.images[0].source.url
        } else{
          object.image = 'http://i.giphy.com/xT5LMN7rhj8hHdwTqE.gif'
        }

        object.id = index
        object.category = obj.data.subreddit
        object.ranking = obj.data.score
        object.summary = obj.data.selftext
        object.url = obj.data.url

        return object
      });

      state.items = newfoo

      renderList(state.items, container)

      //Setup event listner on articles and render popup if clicked
      delegate('body', 'click', '.article-content a', function(event){

        var closestArticle = closest(event.delegateTarget, 'article')

        var articleID = parseInt(closestArticle.dataset.id);

        findObject(articleID, function(obj){
          renderPopUp(obj, modal)
        });

      })

    });
  }

  // Find an object by referencing an identifier, in this case ID
  function findObject(id, resolve){
    state.items.forEach(function(obj){
      var key = Object.keys(obj).filter(function(key) {
        if (obj[key] === id) {
          resolve(obj)
        }
      })[0];
    });
  };

  //Remove popup on exit
  delegate('body', 'click', '#pop-up a', function(event){
    closest(event.delegateTarget, '#pop-up').remove();
  })


// Render Templates
// Render lists
function renderList(data, into) {

  var articles = data.map(function(item){
    return `
    <article class="article" data-id="${item.id}">
      <section class="featured-image">
        <img src="${item.image}" alt="" />
      </section>
      <section class="article-content">
        <a href="#"><h3>${item.title}</h3></a>
        <h6>${item.category}</h6>
      </section>
      <section class="impressions">
        ${item.ranking}
      </section>
      <div class="clearfix"></div>
    </article>
    `
  });

  into.innerHTML = `
  <section id="main" class="wrapper">
  ${articles.join('')}
  </section>
  `
}

// Render popup
function renderPopUp(data, into) {
  into.innerHTML = `
    <div id="pop-up">
      <a href="#" class="close-pop-up">X</a>
      <div class="wrapper">
        <h1>${data.title}</h1>
        <p>
        ${data.summary}
        </p>
        <a href="${data.url}" class="pop-up-action" target="_blank">Read more from source</a>
      </div>
    </div>
  `
}

// Render header
function renderHeader(data, into) {
  into.innerHTML = `
    <section class="wrapper">
      <a href="#"><h1>Feedr</h1></a>
      <nav>
        <section id="search">
          <input type="text" name="name" value="">
          <div id="search-icon"><img src="images/search.png" alt="" /></div>
        </section>
        <ul class="outer">
          <li><a href="#">News Source: <span>Source Name</span></a>
          <ul class="dropdown">
            ${state.categories.map(function (item) {
              return `<li>${renderItem(item)}</li>`
            }).join('')}
          </ul>
          </li>
        </ul>
      </nav>
      <div class="clearfix"></div>
    </section>
  `
}

function renderItem(item) {
  return `
  <a href="#${item.name}">${item.name}</a>
  `
}

})()
