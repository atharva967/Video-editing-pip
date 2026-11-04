# Lead Finder client demo, short cut (target <= 3:30). Same shot format as script.py.
FULL_V = [0, 0, 1280]

CHAPTERS = [
    ("intro", None, [
        ("Most local businesses don't have a proper website. Some have none, some have a broken one, and some are invisible online.",
         [{"card": "types"}]),
        ("Each one is a potential client. So at TechnoTribes, we built Lead Finder, to find them automatically.",
         [{"card": "title"}]),
        ("Here's a quick tour.", [{"card": "chapters"}]),
    ]),
    ("overview", "The Overview", [
        ("Your team signs in with Google, and lands on the Overview: a live summary of every lead found so far.",
         [{"v": [5.4, 9.6], "cam": [[290, 140, 700], FULL_V], "w": 0.35}, {"v": [9.6, 13.0], "cam": [FULL_V, FULL_V], "w": 0.65}]),
        ("One hundred and sixty six leads this week. Ninety six with no website, twenty nine with a bad one, and forty one with low reach.",
         [{"img": "ss-overview", "cam": [[0, 0, 1887], [300, 60, 1060]], "spots": [[337, 130, 235, 155, "Total leads", 0.05], [594, 130, 235, 155, "No website", 0.3], [851, 130, 235, 155, "Bad website", 0.55], [1107, 130, 235, 155, "Low reach", 0.78]]}]),
        ("Twenty nine already have an email, and the whole month of searching cost under three dollars.",
         [{"img": "ss-overview", "cam": [[300, 60, 1060], [860, 60, 1027]], "spots": [[1364, 130, 235, 155, "With email", 0.05], [1621, 130, 235, 155, "Spend this month", 0.5]]}]),
        ("Charts show where the leads are, which kinds of business they are, and how your pipeline is moving.",
         [{"v": [13.0, 21.5], "cam": [FULL_V, [140, 120, 1100]], "w": 0.5}, {"v": [38.0, 46.0], "cam": [[0, 120, 1050], [190, 191, 900]], "w": 0.5}]),
    ]),
    ("leads", "The leads list", [
        ("On the Leads page, every row is a real local business, with its rating, location and contact details.",
         [{"img": "ss-leads", "cam": [[0, 0, 1582], [0, 300, 1250]], "spots": [[35, 365, 320, 580, "Business", 0.1], [890, 365, 290, 580, "Place & rating", 0.4], [1195, 365, 265, 580, "Contact", 0.7]]}]),
        ("And it tells you exactly why it's a lead. A free Square page and no real website. A site that's down. Or a good site with only one review.",
         [{"img": "ss-leads", "cam": [[0, 300, 1250], [250, 330, 1100]], "spots": [[520, 365, 370, 580, "Why it's a lead", 0.05]], "w": 0.45}, {"img": "ss-leads2", "cam": [[0, 0, 1060], [0, 265, 1100]], "spots": [[30, 0, 1060, 265, "Bad website", 0.05], [30, 270, 1060, 560, "Low reach", 0.55]], "w": 0.55}]),
        ("Filter by country, city, category, rating or status, and export to CSV in one click.",
         [{"img": "ss-leads", "cam": [[0, 0, 1582], [0, 0, 1582]], "spots": [[35, 125, 1520, 165, "Filters", 0.05], [1405, 55, 150, 40, "Export CSV", 0.6]]}]),
    ]),
    ("lead", "Inside a lead", [
        ("Open any lead for the full picture. This barber shop has four point eight stars from over five hundred reviews, but no website.",
         [{"v": [62.5, 66.0], "cam": [FULL_V, [380, 0, 900]]}]),
        ("It gets a priority score, so you know who to call first. Lead Finder also checks the website's speed and problems, so you know what to pitch.",
         [{"v": [66.0, 73.0], "cam": [[380, 0, 900], [380, 191, 900]]}]),
        ("Here's another kind of lead: a handyman with a good website, but only one review and no social media. A perfect fit for a growth package.",
         [{"v": [111.0, 118.0], "cam": [FULL_V, [380, 0, 900]]}]),
        ("Then track it: set a status, assign an owner, and add notes.",
         [{"v": [73.0, 80.0], "cam": [[380, 191, 900], [380, 191, 900]]}]),
    ]),
    ("search", "Running searches", [
        ("New leads come from searches. Pick a country, a city and a type of business. Each search costs about twelve cents.",
         [{"v": [140.0, 151.0], "cam": [FULL_V, [0, 60, 900]], "w": 0.55}, {"img": "ss-runs", "cam": [[0, 300, 1000], [0, 300, 1000]], "spots": [[60, 625, 425, 112, "Cost & limits", 0.1]], "w": 0.45}]),
        ("Every run is logged: what it searched, how many places it found, how many were new, and what it cost.",
         [{"img": "ss-runs", "cam": [[0, 300, 1000], [530, 120, 1046]], "spots": [[1062, 205, 120, 750, "Found / new", 0.3], [1212, 205, 75, 750, "Cost", 0.6]]}]),
        ("And a nightly queue runs saved searches automatically, within your monthly budget. So fresh leads arrive while you sleep.",
         [{"v": [151.5, 157.5], "cam": [FULL_V, [380, 191, 900]]}]),
    ]),
    ("team", "Team access", [
        ("Admins control exactly who can sign in, with a role for each person.",
         [{"v": [170.5, 182.0], "cam": [FULL_V, [380, 40, 900]]}]),
        ("And a suppressed list keeps businesses you never want to see out of your results.",
         [{"v": [182.0, 186.0], "cam": [[380, 40, 900], FULL_V]}]),
    ]),
    ("wrap", None, [
        ("Lead Finder finds the businesses that need you, explains why, and keeps your pipeline full, automatically.",
         [{"v": [186.0, 193.3], "cam": [FULL_V, [140, 0, 1100]]}]),
        ("Want a lead engine like this for your business? Talk to TechnoTribes.",
         [{"card": "outro"}]),
    ]),
]
