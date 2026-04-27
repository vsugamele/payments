# Research on auth DNS failures in

## What the log actually proves

Your stack trace shows `signInWithPassword` calling the Auth token route with `grant_type=password`. In the Supabase JavaScript docs, `signInWithPassword` is the email/password login flow. The important part is the browser error: `net::ERR_NAME_NOT_RESOLVED`. That means your failing session is breaking before the Auth service can process the request. When that same endpoint is reachable, it returns a normal HTTP response instead of a browser DNS error. citeturn19view2turn15view1

In plain terms, this is not evidence of “wrong password.” It is evidence that, on your failing path, the browser cannot successfully resolve or reach the hostname at the moment it tries to log in. That makes this a connectivity or name-resolution problem first, and an authentication problem only second. citeturn15view1turn19view2

## What I verified about your exact project URL

I checked the exact hostname you posted: `tkbivipqiewkfnhktmqq.supabase.co`. From my vantage point, the project root responded with HTTP `404 Not Found`, and the exact Auth token URL responded with HTTP `401 Unauthorized`. Those are live application-layer responses, which means the hostname currently resolves and reaches a running server from at least one public network. citeturn15view0turn15view1

That matters a lot for diagnosis. If the project had been globally deleted, or if the DNS record were universally missing, I would expect the hostname itself to fail broadly rather than return normal HTTP responses. So the evidence does **not** support “this project ref is dead everywhere.” It supports “the hostname is alive, but some users or networks are failing to resolve or reach it.” citeturn15view0turn15view1

## Evidence that other people are affected

Yes—there is direct public evidence that other users are seeing similar login trouble right now. On April 17, 2026, Supabase’s status page listed an unresolved “Login Issues with Supabase Auth” incident. The updates said the impact was limited to a subset of users, first primarily in entity["place","South America","continent"] and later in both South and entity["place","North America","continent"], and said Supabase was working with partner organizations while investigating. That is strong confirmation that this is not just you. citeturn7view0

There is also a broader pattern of selective reachability problems in public reports. On entity["company","GitHub","code hosting platform"], one April 2025 issue reported browser-side `ERR_NAME_NOT_RESOLVED` against a project API, a February 2026 issue described DNS poisoning of `*.supabase.co` on entity["company","Jio","india telecom operator"], and another February 2026 discussion described Supabase becoming accessible only when a VPN was enabled. entity["organization","TechCrunch","technology publication"] later reported a broader access disruption affecting Supabase in entity["country","India","south asia"]. Taken together, these sources show that network- or provider-scoped failures to `*.supabase.co` have happened before and can affect some users while others continue working normally. citeturn8view1turn8view0turn18view0turn9search0

## Why your symptom pattern matters

Your symptom pattern points away from a dead project and toward a selective access problem. The hostname is reachable from outside your network, and Supabase is publicly acknowledging a subset-user Auth incident today. That combination fits a scenario where your friends can log in normally while you cannot. citeturn15view0turn15view1turn7view0

The fact that you see the issue on more than one device also weakens the “single browser glitch” theory. It does **not** prove the problem is on Supabase’s side, but it does make a one-off local cache or extension problem less convincing. The strongest remaining explanations are either the current partial Auth incident, or DNS/routing trouble on the networks you are using. citeturn7view0turn15view0turn15view1

This also does **not** look like the common direct-Postgres IPv6 pitfall that shows up in Supabase database connection troubleshooting. Supabase’s networking docs say the IPv6 caveat applies to direct database hostnames, while client libraries are IPv4 compatible. Your failing request is a browser Auth call through `signInWithPassword`, not a raw Postgres connection. citeturn19view0turn19view2

## The fastest way to separate outage from DNS or provider trouble

A few very targeted tests will tell you which bucket you are in.

- Open `https://tkbivipqiewkfnhktmqq.supabase.co/` directly on the failing device. If you get **any** HTTP response at all—even a 404 page—then DNS is resolving on that device and the problem is further up the stack. If you still get `ERR_NAME_NOT_RESOLVED`, the failure is still happening before HTTP. The same URL returned 404 from my external check. citeturn15view0

- Retry once through a VPN. If login immediately starts working, that is strong evidence for DNS, routing, or provider-path interference rather than a dead project. That pattern matches prior Supabase user reports and known ISP-scoped incidents. citeturn8view0turn18view0

- Compare your default resolver against a public resolver:

```bash
nslookup tkbivipqiewkfnhktmqq.supabase.co
nslookup tkbivipqiewkfnhktmqq.supabase.co 1.1.1.1
```

If the public resolver answers but the default resolver does not, your resolver path is the problem. Supabase’s own networking docs and prior issue reports use `nslookup` and `dig` as the way to verify whether a hostname is resolving correctly. citeturn19view0turn8view0

- Keep checking the official status page today. Because the current Auth incident is unresolved and affects only a subset of users, the issue may clear without any local change if Supabase or one of its partners fixes the underlying path problem. citeturn7view0

## Bottom line

Yes—there is solid evidence that more people are experiencing similar symptoms. The key finding for **your** case is that the exact project hostname you posted is alive and responding from outside your network, so your `ERR_NAME_NOT_RESOLVED` is unlikely to mean “the client’s Supabase project no longer exists.” The stronger reading is that access is failing **selectively**: either because of today’s partial Supabase Auth incident affecting a subset of users, or because a DNS/routing/provider layer between you and `.supabase.co` is breaking resolution on the networks you are using. citeturn15view0turn15view1turn7view0turn8view0