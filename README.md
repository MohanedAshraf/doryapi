[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/e18889a4eda14c14b99db048718e411a)](https://app.codacy.com/manual/aman-atg/Job-Listing-Demo-Site?utm_source=github.com&utm_medium=referral&utm_content=aman-atg/Job-Listing-Demo-Site&utm_campaign=Badge_Grade_Dashboard)
![Maintained](https://img.shields.io/maintenance/yes/2020)
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://doryapi.herokuapp.com">
    <img src="public/favicon-32x32.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Dory </h3>

  <p align="center">
  API for Dory App
    <br />
    <h4 align="center">Give a star ⭐ if you like it ❤️  </h4>
    <br/>
    <p align="center"> 
    :link: <a href="https://doryapi.herokuapp.com">  Live </a>
    &#8226; 
   :bug: <a href="https://github.com/MohanedAshraf/Dory-API/issues">Report Bug or Request Feature</a>
    &#8226; 
    :sparkles:<a href="https://documenter.getpostman.com/view/8191338/SzS7R6zN?version=latest&fbclid=IwAR1QoQGOU_3JOGAFbKMh5PIEQ_jHG31_3OwaUPII3Vni1-oBdVjp8FSwso8">Postman Doc</a></p>
     
  </p>
</p>

<!-- TABLE OF CONTENTS -->

## Table of Contents 📋 

- [About the Project](#about-the-project-eyes)
  - [Built With](#built-with-hammer)
- [Getting Started](#getting-started-)
  - [Prerequisites](#prerequisites-)
  - [Installation](#installation-arrow_down)
- [Contributing](#contributing-)
- [License](#license-)
- [Authors](#authors-closed_book)


<!-- ABOUT THE PROJECT -->

## About The Project :eyes: 

An API for Dory App , Dory is an Online Medical Booking App It allows the patient to book Appointments , search for Doctors and Labs  , chat with Doctors and Request Home Consultation or Home Test .


### Built With :hammer:

- [Node.js](https://nodejs.org)
- [Express](https://expressjs.com)
- [Socket.IO](https://socket.io)
- [MongoDB](https://www.mongodb.com)

<!-- GETTING STARTED -->

## Getting Started 🚀 

To get a local copy up and running follow these simple example steps.

### Prerequisites 💻 

- Node ([Download here!](https://nodejs.org/en/download))

### Installation :arrow_down: 

**1.** Fork [this](https://github.com/aman-atg/Dory-API) repository :fork_and_knife:

**2.** Clone your forked repository to your local system :busts_in_silhouette:

```sh
git clone https://github.com/<your-username>//Dory-API.git
```

Or Download and extract the zip file.

 ### Environmental Variables

 For developers, you can directly use our `config.env.env` located in `config\config.env.env` or modify it if you like.

 For production, you need to make your own `config\config.env` with the following structure.
 
 ```json

  NODE_ENV=production
  PORT=5000

  MONGO_URI=mongodb://localhost:27017/YourCollection

  GEOCODER_PROVIDER=mapquest
  GEOCODER_API_KEY=0000

  FILE_UPLOAD_PATH= ./public/uploads
  MAX_FILE_UPLOAD=1000000

  JWT_SECRET=0000000
  JWT_EXPIRE=30d
  JWT_COOKIE_EXPIRE=30

  SMTP_HOST=smtp.mailtrap.io
  SMTP_PORT=2525
  SMTP_EMAIL=000000
  SMTP_PASSWORD=0000000
  FROM_EMAIL=mohaned@dory.com
  FROM_NAME=doryTeam

  FACEBOOK_ID=00000000
  FACEBOOK_SECRET=000000000

  GOOGLE_ID=000000000
  GOOGLE_SECRET=000000000

 ```
* `NODE_ENV`: It should be `"production"` in order to run the api on production otherwise use `"development"`
* `PORT`: Your api hosting port
* `MONGO_URI`: Your database path 
  > Eg: `"mongodb://localhost:27017/YourCollection"` If you're hosting on your localhost server.
* `JWT_SECRET`: Your json web token secret key.
* `JWT_EXPIRE`: The period token can last before expiring expressed in seconds or a string describing a time span
  > Eg: `60`, `"2 days"`, `"10h"`, `"7d"`. A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default (`"120"` is equal to `"120ms"`).
* `FACEBOOK_ID` and `FACEBOOK_SECRET`: Are used for signing up with facebook.
* `GOOGLE_ID` and `GOOGLE_SECRET`: Are used for signing up with google.
* `SMTP_HOST`: The provider for sending emails
* `SMTP_EMAIL` and `SMTP_PASSWORD`: The email and password key for sending emails through mailtrap.io


### Running

**1.** Install NPM packages :arrow_down:

```sh
npm install
```

**2.** Run! :running_man:

```sh
npm start
```


<!-- CONTRIBUTING -->

## Contributing 🤝 

Any contributions you make are **greatly appreciated**.

1. Create your Branch (`git checkout -b master/test-branch`)
2. Commit your Changes (`git commit -m 'Add some code'`)
3. Push to the Branch (`git push origin master/test-branch`)
4. Open a Pull Request

<!-- LICENSE -->

## License 📝 

Distributed under the MIT License. See [`LICENSE`][license-url] for more information.

<!-- CONTACT -->

## Authors :closed_book: 

- [Mohaned Ashraf](https://github.com/MohanedAshraf)



  <!-- MARKDOWN LINKS & IMAGES -->

[forks-shield]: https://img.shields.io/github/forks/MohanedAshraf/Dory-API?style=flat-square
[forks-url]: https://github.com/MohanedAshraf/Dory-API/network/members
[stars-shield]: https://img.shields.io/github/stars/MohanedAshraf/Dory-API?style=flat-square
[stars-url]: https://github.com/MohanedAshraf/Dory-API/stargazers
[issues-shield]: https://img.shields.io/github/issues/MohanedAshraf/Dory-API?style=flat-square
[issues-url]: https://github.com/MohanedAshraf/Dory-API/issues
[license-shield]: https://img.shields.io/github/license/MohanedAshraf/Dory-API?style=flat-square
[license-url]: https://github.com/MohanedAshraf/Dory-API/blob/master/LICENSE
