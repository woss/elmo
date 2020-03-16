# Welcome

Current title is **ELMO - Efficient Link Management and O**, but i'm looking for better alternatives, if you want to participate in deciding click [here and VOTE](https://linkto.run/p/L62X0YTC)

Results can ber found [here](https://linkto.run/r/L62X0YTC)

Options:

- ELMO - Efficient Link Management and O

- ELMo - Efficient Link Management and o

- ELMØ - Efficient Link Management and Ø

- ELMø - Efficient Link Management and ø

- ELMÅ - Efficient Link Management and Å

- ELMå - Efficient Link Management and å

Elmo is available for chromium based browser. This is just a proof of concept to show the real world use case of IPFS and orbitDB. I hope you will give it a go and you will like it.

It is fairly stable and sometimes slow with replication, that is due to the mechanics of the underlying layer, OR it could be just me and my programming. In any case feel free to contribute with the code or the advice. All are much appreciated.

## What will this do to my Browser

ELMO will spin up the IPFS and OrbitDB instance in your browser, connect to the public web and listen to the connections if you wish to replicate the links and collections across your devices.

## Security and encryption

Data is NOT encrypted, it will be eventually, check out the issue [here](https://gitlab.com/woss_io/elmo/-/issues/10) which is good place to see the progress.

From the security point fo view, all the data is kept in sandbox environment which is available only to the extension itself. The connection to the public is only there for its discovery, not for sending any data.

**NOTE::::::**
There is a built extension which is ready for download, unfortunately it is not verified from google or brave, thus it might not work. Recommended way is to build it yourself.

## Get started

Commands below will get you started with the development of the extension and give you a bundle which you can load into your browser.

Requirements are:

- [nodejs 10+](https://nodejs.org/en/download/)
- [yarn](https://yarnpkg.com/getting-started/install)
- text editor ( [VScode is my choice](https://code.visualstudio.com/Download))

When you all that run the commands from the terminal.

```sh
git clone https://gitlab.com/woss_io/elmo.git
cd elmo
yarn
yarn dev
```

Now you are ready to load the extension.
Check out this to see the demo...


![intro](./assets/how-to-video/intro.gif)
