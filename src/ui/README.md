# DMS UI

[![Lifecycle:Maturing](https://img.shields.io/badge/Lifecycle-Maturing-007EC6)](<Redirect-URL>)

The DMS is a full-featured Dispute Management System.  This readme is for the DMS UI (User Interface).  A Readme document and architecture diagram is also available in the [full DMS solution readme.md](../../README.md) and separate mid-tier documentation is available in the [DMS mid-tier readme.md](../../src/mid-tier/README.md)

![DMS System](../../DMS_Devices.jpg)

## The 7 DMS Sites

**Admin:** This is the fully-featured case management system for internal staff.  This includes automated delivery and notifications, notice generation, decision generation, complex dispute management, staff and hearing scheduling, work assignment and tracking, etc.

**Office Submissions:** This is a site for remote office staff that allows them to perform common front-desk actions on disputes files for in-person actions and submissions. This includes new applications, digitized paper and form-based submissions, and front-desk payments, etc.

**Online Intake (3 Sites):** These are sites that provide guided intuitive applications for service.  The 3 sites address general applications, specialized applications, and the submission of compliance and enforcement complaints.

**Dispute Access:** This is an external access site that allows guided intuitive digital submissions based on specific dispute file criteria. Common actions include submitting digital evidence, indicating service and document disclosure, submitting amendments, submitting substituted service requests, submitting requests for corrections, clarifications and reviews, updating contact information, etc.

**Posted Decisions:** This is a public site for searching anonymized decisions from resolved DMS files

## Building the DMS UI

This project uses `npm` and `yarn` for package dependency management.

## DMS UI Installation Dependencies

A list of dependent packages and their licensing is available in the [dependentpackage_licenses.txt](dependentpackage_licenses.txt) document.

First install yarn packages.
```shell
yarn install
```

Then copy environment variable over.

Then run npm install for packages.
```shell
npm install
```

### DMS UI Builds, Development servers, Pipelines

The commands to run and build the site(s) are located in package.json, and can be modified as needed.  These built-in commands share a similar syntax:

<b>Site name</b> (`site`):

`admin` : The Admin site for internal staff users<br/>
`office` : The Office Submissions site, for support staff users<br/>
`intake` : The standard Online Intake site, for external users<br/>
`intake2` : The Additional Landlord Intake site, for external users<br/>
`ceu` : The Compliance and Enforcement Unit Intake site, for external users<br/>
`evidence` : The Dispute Access site, for external users<br/>
`decisions` : The Posted Decisions site<br/>


<b>Environment / build type</b> (`environment`):

`dev` : The development environment. Code is not minified.<br/>
`staging` : The development environment. Code is not minified.<br/>
`preprod` : The pre-production environment. Code is minified.<br/>
`prod` : The production environment. Code is minified.<br/>


### DMS UI Development server commands
To start a webpack dev server to run your app locally on some pre-defined ports, you can use yarn commands formatted like: ```dev:<site>```.

For example, to run Admin in webpack dev server:
```shell
# yarn dev:<site>
$ yarn dev:admin
```

### DMS UI Builds commands
Sites can be built individual or at once. Builds create a version of the app and will output everything into the `public/` folder.  Build commands for a specific site are formatted like: ```build:<site>:<environment>```, and the commands to build all sites are formatted like: ```build:<environment>```.

For example, to create a PreProd build of the standard Online Intake:
```shell
# yarn build:<site>:<environment>
$ yarn build:preprod:intake
```

Or, to build all sites for production:
```shell
# yarn build:<environment>
$ yarn build:prod
```

### DMS UI Linter

```shell
$ yarn lint
```

## DMS UI License

![MIT License](../../DMS_MIT_Permissions_Conditions_Limitations.png)

MIT: with a license and copyright notice, and a promotion and advertising notice.  See the [LICENSE.txt](../../LICENSE) for details.

## DMS UI Contributions and Contact

This is an unsupported open-source repository that was published to share the code base with those that may benefit from its public availability.  We are initiating engagement with the broader dispute resolution marketplace to seek open-source sharing and contribution opportunities.  Our intent is to create a community of suitable co-investors and contributors that will achieve significant cost savings and technological innovation through open-source sharing.  If you are a resolution organization interested in leveraging the DMS solution, please contact Hive One through our justice services web site www.hive1-js.com and we will add you to our list that we are vetting for suitability as the second and third movers that will be critical to the establishment a viable and sustainable community.
