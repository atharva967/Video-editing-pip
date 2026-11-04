# Lead Finder client demo: narration and shot list.
# Each line is spoken once; its shots fill the line's duration (split by weight "w").
#   video shot:  {"v": [a, b]}            source seconds of leadfinder recording (browser bar cropped)
#   image shot:  {"img": "ss-overview"}   one of the user's screenshots (sharper than the video)
#   card shot:   {"card": "types"}        full-window graphic
#   cam:   [start_rect, end_rect] as [x, y, w] in the shot's own pixels (height follows the window)
#   spots: [[x, y, w, h, label, start_frac], ...] highlight boxes in the shot's own pixels
# Video space: 1280 x 647 (720p recording minus the 73 px browser bar).
# Screenshots: overview 1887x967, overview2 1877x965, leads 1582x956, leads2 1585x970, runs 1576x957.

FULL_V = [0, 0, 1280]

CHAPTERS = [
    ("intro", None, [
        ("Most local businesses still don't have a proper website. Some have none at all, some have one that's slow or broken, and some are simply invisible online.",
         [{"card": "types"}]),
        ("Every one of them is a potential client. The hard part is finding them. So at TechnoTribes, we built Lead Finder.",
         [{"card": "title"}]),
        ("In the next few minutes, I'll show you how it finds these businesses automatically, ranks them, and gives your team everything it needs to reach out.",
         [{"card": "chapters"}]),
    ]),
    ("signin", "Secure sign-in", [
        ("Lead Finder is a private dashboard for your team. Everyone signs in with their Google account, and only approved team members can get in.",
         [{"v": [0, 5.4], "cam": [FULL_V, [290, 140, 700]]}]),
        ("One click, and you're in.", [{"v": [5.4, 9.6], "cam": [[290, 140, 700], FULL_V]}]),
    ]),
    ("overview", "The Overview", [
        ("The first thing you see is the Overview: a live summary of every lead found so far, matching the Google Sheet that the system keeps up to date.",
         [{"v": [9.0, 13.0], "cam": [FULL_V, FULL_V]}]),
        ("Right now there are one hundred and sixty six leads, all found in the last seven days.",
         [{"img": "ss-overview", "cam": [[0, 0, 1887], [300, 60, 1000]], "spots": [[337, 130, 235, 155, "Total leads", 0.35]]}]),
        ("Every lead falls into one of three types. Ninety six businesses have no website at all. Twenty nine have a website that's broken, slow or outdated. And forty one have a decent site, but almost no reach online.",
         [{"img": "ss-overview", "cam": [[300, 60, 1000], [560, 60, 1060]], "spots": [[594, 130, 235, 155, "No website", 0.18], [851, 130, 235, 155, "Bad website", 0.45], [1107, 130, 235, 155, "Low reach", 0.72]]}]),
        ("So you know not just who to contact, but what to offer each one: a new website, a redesign, or help growing their reach.",
         [{"img": "ss-overview", "cam": [[560, 60, 1060], [0, 0, 1887]], "spots": [[594, 130, 748, 155, "Three ways to help", 0.2]]}]),
        ("Twenty nine leads already come with an email address. And all of this scraping has cost just two dollars and eighty nine cents this month.",
         [{"img": "ss-overview", "cam": [[560, 60, 1060], [860, 60, 1027]], "spots": [[1364, 130, 235, 155, "With email", 0.1], [1621, 130, 235, 155, "Spend this month", 0.55]]}]),
        ("The charts break your leads down by country, and show how many new ones arrive each week.",
         [{"v": [13.0, 21.5], "cam": [FULL_V, [140, 120, 1100]]}]),
        ("Scroll down, and you'll see which kinds of business produce the most leads. Beauty salons, electricians and handymen are at the top.",
         [{"img": "ss-overview2", "cam": [[0, 0, 1877], [330, 0, 1050]], "spots": [[340, 0, 750, 420, "Top categories", 0.3]]}]),
        ("The lead status chart tracks your pipeline: new, contacted, interested, won, or lost.",
         [{"img": "ss-overview2", "cam": [[330, 0, 1050], [877, 0, 1000]], "spots": [[1110, 0, 750, 420, "Lead status", 0.25]]}]),
        ("And at the bottom, a map shows exactly where your leads are, region by region.",
         [{"v": [38.0, 51.0], "cam": [[0, 120, 1050], [190, 191, 900]]}]),
    ]),
    ("leads", "The leads list", [
        ("Now let's open the Leads page. This is where the real work happens.",
         [{"v": [52.0, 57.0], "cam": [FULL_V, FULL_V]}]),
        ("Each row is a real local business, with its category, its location, its Google rating and number of reviews, and its phone number and email when they're available.",
         [{"img": "ss-leads", "cam": [[0, 0, 1582], [0, 300, 1250]], "spots": [[35, 365, 320, 580, "Business", 0.15], [890, 365, 290, 580, "Place & rating", 0.45], [1195, 365, 265, 580, "Contact", 0.72]]}]),
        ("The lead type shows the opportunity at a glance, and the next column explains exactly why it's a lead. For example, a free Square page and no website of its own. Or only a booking page.",
         [{"img": "ss-leads", "cam": [[0, 300, 1250], [250, 330, 1100]], "spots": [[355, 365, 145, 580, "Lead type", 0.1], [520, 365, 370, 580, "Why it's a lead", 0.4]]}]),
        ("Further down are the other types. Bad websites that aren't mobile friendly, have no contact form, or are down completely.",
         [{"v": [88.0, 97.0], "cam": [FULL_V, FULL_V], "w": 0.45}, {"img": "ss-leads2", "cam": [[0, 0, 1100], [0, 0, 1060]], "spots": [[30, 0, 1060, 265, "Bad website", 0.15]], "w": 0.55}]),
        ("And low reach businesses: a good website, but only a handful of reviews and no social media.",
         [{"img": "ss-leads2", "cam": [[0, 0, 1060], [0, 265, 1100]], "spots": [[30, 270, 1060, 560, "Low reach", 0.2]]}]),
        ("At the top, filters narrow the list by country, region, city, category, lead type, rating, status or owner. You can show only leads with an email, and export everything to a CSV file in one click.",
         [{"v": [84.0, 88.0], "cam": [FULL_V, FULL_V], "w": 0.3}, {"img": "ss-leads", "cam": [[0, 0, 1582], [0, 0, 1582]], "spots": [[35, 125, 1520, 165, "Filters", 0.1], [1405, 55, 150, 40, "Export CSV", 0.7]], "w": 0.7}]),
    ]),
    ("lead", "Inside a lead", [
        ("Click any lead to open its details. Here's Douglasdale Barber Shop in Calgary. A four point eight star rating from over five hundred reviews, but no website of its own, only a free Square page.",
         [{"v": [62.5, 66.0], "cam": [FULL_V, [380, 0, 900]]}]),
        ("Every business gets a priority score out of one hundred, so your team always knows who to call first. This one scores ninety two.",
         [{"v": [66.0, 69.0], "cam": [[380, 0, 900], [380, 120, 900]]}]),
        ("Lead Finder also checks the website itself. It measures page speed and lists the problems it finds, like slow loading, no way to contact the business, or missing SEO. Each problem adds to a need score.",
         [{"v": [69.0, 73.0], "cam": [[380, 120, 900], [380, 191, 900]]}]),
        ("So when you call, you already know what's wrong with their site, and how you can fix it.",
         [{"v": [72.0, 73.5], "cam": [[380, 191, 900], [430, 191, 850]]}]),
        ("Contacts found online are listed with the page they came from. And at the bottom, the follow up section lets you set a status, assign an owner, and keep notes.",
         [{"v": [73.0, 83.0], "cam": [[380, 191, 900], [380, 0, 900]]}]),
        ("Here's a low reach lead: Handyman Pros Calgary. A good website, but only one review and no social media. Its priority is ninety seven.",
         [{"v": [111.0, 118.0], "cam": [FULL_V, [380, 0, 900]]}]),
        ("You can jump straight to the business's website, to see what they have today, and what you could build for them.",
         [{"v": [118.0, 124.6], "cam": [[380, 0, 900], [380, 60, 900]]}, {"v": [126.8, 131.6], "cam": [FULL_V, FULL_V]}]),
        ("Then come back to the list, and move on to the next one.",
         [{"v": [132.0, 139.5], "cam": [[380, 0, 900], FULL_V]}]),
    ]),
    ("search", "Running searches", [
        ("New leads come from searches. On the Run a search page, you pick a country, a city and a type of business, like dentists in Pune, or plumbers in Austin.",
         [{"v": [140.0, 151.0], "cam": [FULL_V, [0, 60, 900]]}]),
        ("Each search looks at up to twenty places on Google Maps, and costs about twelve cents. Built in limits keep spending under control, with a daily run limit and a monthly budget.",
         [{"img": "ss-runs", "cam": [[0, 0, 1576], [0, 300, 1000]], "spots": [[60, 625, 425, 112, "Cost & limits", 0.3]]}]),
        ("Results land in Leads and the Google Sheet within about three to ten minutes. Recent runs shows every search, how many places it found, how many were new, and what it cost.",
         [{"img": "ss-runs", "cam": [[0, 300, 1000], [530, 120, 1046]], "spots": [[1062, 205, 120, 750, "Found / new", 0.35], [1212, 205, 75, 750, "Cost", 0.65]]}]),
        ("And you don't have to run searches by hand. The nightly queue runs one saved search every night, oldest first, until the monthly budget is reached. So fresh leads keep arriving while you sleep.",
         [{"v": [151.5, 157.5], "cam": [FULL_V, [380, 191, 900]]}]),
    ]),
    ("team", "Team access", [
        ("Finally, the Team page. Admins decide exactly who can sign in. Add a Google email, choose a role, and that person gets access.",
         [{"v": [170.5, 182.0], "cam": [FULL_V, [380, 40, 900]]}]),
        ("Remove an email, and their access ends right away. There's also a suppressed list, for businesses you never want to see again.",
         [{"v": [182.0, 186.0], "cam": [[380, 40, 900], FULL_V]}]),
    ]),
    ("wrap", None, [
        ("So that's Lead Finder. It finds local businesses that need a better online presence, explains why each one is a lead, ranks them, and keeps your pipeline full, automatically.",
         [{"v": [186.0, 193.3], "cam": [FULL_V, [140, 0, 1100]]}]),
        ("Your team spends its time talking to the right businesses, instead of searching for them.",
         [{"img": "ss-overview", "cam": [[0, 0, 1887], [200, 100, 1500]]}]),
        ("Want a lead engine like this for your business? Talk to TechnoTribes.",
         [{"card": "outro"}]),
    ]),
]
