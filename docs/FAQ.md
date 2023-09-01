# FAQ

### Will there be pdf support?
Currently, there are no plans to support PDF, or formats other than the ones already planned.
The app is built around EpubJS and is designed for responsive book formats. Including PDF support would mean incorporating something like pdf.js and would require tons of effort and rewrite which is completely off course at this moment.

### When will mobile support be released?
Currently my objective is to finish up all 1.0 features and deliver a completed stable and reliable desktop application. Afterwards my focus will shift to mobile support

### Where is the MacOS Build?
Currently there is no ETA on MacOS builds. While the app is ready for desktop, I would need access to an Apple machine in order to produce builds.

### How will syncing work
I am aiming to have ALL books, data, and app settings sync so everything is as you left off.

**TLDR**; I have not decided on an approach yet, 

Syncing
Cloud services are convenient and very user friendly. I really like this approach because it is accessible to non technical people. But it comes with some drawbacks.

Merge conflicts
If the app first force overrides the local data when it's opened with the cloud data, you could accidentally override with outdated data.
For example:
If you read for an extended period on your phone while it's offline, and then you open accidentally the app on your desktop, the cloud would show that there is new data (from the desktop), and override your phone's local data.
Unless a custom conflict strategy is devised, using the most recent cloud copy could be a bad user experience.

Privacy
Cloud services do maintain a database of bad file hashes. A book that you backed up could trigger this system, and cause issues with syncing as the file will be automatically deleted off the cloud.
While encrypting data (Like your annotations) is quick, encrypting and decrypting a library of books can be time consuming on some devices.
Alternatively, I can investigate supporting self hosted solutions like couchbase or pouchdb.
This conflict resolution strategy really sold me on it: https://www.couchbase.com/blog/conflict-resolution-couchbase-mobile/
The downside of this is that self hosting is not accessible to casual users.
Syncing is still a fair bit down the roadmap so there is plenty of time to decide on the approach.

