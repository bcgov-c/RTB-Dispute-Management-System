# DMS SYSTEM

## Overview

The Dispute Management System (DMS) is a suite of sites and features that enables robust dispute resolutions within an organization.

## Sites and Features
<b>Admin</b>

Full-featured case management system for internal staff.  Includes scheduling, in-depth dispute management, and work tracking.

<b>Office Submissions</b>

Internal site for support staff to perform actions on a dispute on behalf of an external user. New disputes can also be created here on behalf of a user.

<b>Online Intake</b>

Multi-step online intake for landlords and tenants to initiate residential tenancy disputes. Features user authentication and online payment integration and fee waivers.

<b>Additional Landlord Intake</b>

Multi-step online intake for landlords to create two types of non-standard applications: an application for rent increase due to eligible capital expenditures, and application for vacant possession of unit for renovations or repairs.

<b>Compliance and Enforcement Unit (CEU) Intake</b>

Multi-step online intake to report issues that are outside the purview of the Residential Tenancy Branch (RTB) and within the scope of the CEU group.

<b>Dispute Access</b>

External access site for users to add or modify information on an in-flight dispute. Common actions include adding evidence, updating contact information, validating proof of notice.


<b>Posted Decisions</b>

A public site for searching final anonymized decisions added in the Admin site.

---

## Build / Install
This project uses `npm` and `yarn` for package dependency management.

### Installing Dependencies

First install yarn packages.
```shell
yarn install
```

Then copy environment variable over.

Then run npm install for packages.
```shell
npm install
```

### Builds, Development servers, Pipelines

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


#### Development server commands
To start a webpack dev server to run your app locally on some pre-defined ports, you can use yarn commands formatted like: ```dev:<site>```.

For example, to run Admin in webpack dev server:
```shell
# yarn dev:<site>
$ yarn dev:admin
```

#### Builds commands
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

### Linter

```shell
$ yarn lint
```
