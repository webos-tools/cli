# @webos-tools/cli

**@webos-tools/cli** is a Command-Line Interface (CLI) for webOS. It provides a collection of commands for creating, packaging, installing, and launching webOS apps or services in a command-line environment. With @webos-tools/cli, you can develop and test your app or service without using any IDE.

## Announcement

**We moved here from @webosose/ares-cli.** In the future, we plan to develop and maintain a single webOS CLI here to support webOS.

We are releasing a single CLI that supports both webOS OSE and webOS TV through this released CLI (v3.0.0). You can switch to CLI for OSE or TV by installing one CLI and changing only the profile. For more details, see [Profile Settings](#profile-settings).

## Installation

> [!IMPORTANT]
> If @webosose/ares-cli is installed globally, uninstall it before install globally @webos-tools/cli.
>
> ``` shell
> # Uninstall globally @webosose/ares-cli
> $ npm uninstall -g @webosose/ares-cli
> ```
>
> ``` shell
> # Check whether uninstall @webosose/ares-cli
> $ ares -V
> ares: command not found
> ```

The @webos-tools/cli is installed using `npm`.

> Note: @webos-tools/cli was tested on Node.js v14.15.1 and v16.20.2.

You can install @webos-tools/cli using the following command. We recommend installing it globally. For Linux and macOS, you might need the `sudo` command.

``` shell
$ npm install -g @webos-tools/cli
```

## Profile Settings

You can change the profile to `tv` or `ose`. The default profile is `tv` (webOS TV).

``` shell
$ ares-config --profile ose
profile and config data is changed to ose
```

You can change the profile at any time while using the CLI by using the above command.

## Compatibility

The release cycle of @webos-tools/cli is independent from that of webOS OSE or webOS TV. The latest CLI is compatible with the latest webOS OSE and webOS TV. So, we recommend using the latest version of CLI.

If you want to use previous version of CLI, check the compatibility table for each platform.

- [Compatibility of webOS OSE CLI](https://www.webosose.org/docs/tools/sdk/cli/cli-release-notes/#compatibility)
- [Compatibility of webOS TV CLI](https://webostv.developer.lge.com/develop/tools/sdk-introduction#compatible-sdkversiontools-by-release-year)

## Command List

The following table shows a list supported commands. For more details, refer to user guides in [Documentation](#documentation).

| Command           | Description                                                                    | OSE | TV |
|-------------------|--------------------------------------------------------------------------------|:---:|:--:|
| ares-config       | Configures webOS CLI.                                                          |  v  | v  |
| ares              | Displays the help information for ares commands.                               |  v  | v  |
| ares-generate     | Creates a webOS app or service from templates.                                 |  v  | v  |
| ares-package      | Packages the app or services into a package file.                              |  v  | v  |
| ares-setup-device | Manages the target devices.                                                    |  v  | v  |
| ares-novacom      | Command Line Tool to control the device.                                       |     | v  |
| ares-install      | Installs the app or service on the target device.                              |  v  | v  |
| ares-launch       | Launches or terminates the app.                                                |  v  | v  |
| ares-inspect      | Enables Web Inspector or Node's Inspector for debugging web app or JS service. |  v  | v  |
| ares-server       | Runs the Web server for testing local app file.                                |  v  | v  |
| ares-shell        | Executes shell commands in the target device.                                  |  v  |    |
| ares-push         | Pushes file(s) from a host machine to a target device.                         |  v  |    |
| ares-pull         | Pulls file(s) from a target device to a host machine.                          |  v  |    |
| ares-device       | Displays the device information.                                               |  v  | v  |
| ares-log          | Shows or saves logs of webOS apps and services.                                |  v  |    |

## Documentation

For `ose` profile:

- How to use webOS OSE CLI, see the [webOS OSE CLI User Guide](https://www.webosose.org/docs/tools/sdk/cli/cli-user-guide/).
- How to develop external Web/QML/Native apps or JS/Native services for webOS OSE, see the [webOS OSE Tutorials](https://www.webosose.org/docs/tutorials/).

For `tv` profile:

- How to use webOS TV CLI, see the [webOS TV CLI Introduction](https://webostv.developer.lge.com/develop/tools/cli-introduction).
- How to develop web apps or JS services for webOS TV, see the [webOS TV Developer Guide](https://webostv.developer.lge.com/develop/tools/cli-dev-guide).

## Testing

You can test the @webos-tools/cli commands and their options to check their validity. Tests are performed by `jasmine`.

### Prerequisites

1. Turn on the webOS device.
2. Check the IP address and SSH port number.
3. (Only for webOS TV) Enable the developer mode. See [App Testing with Developer Mode App](https://webostv.developer.lge.com/develop/getting-started/developer-mode-app)

### Performing the Test

The following table lists the default configurations for the test.

| Parameter | Value     |
| :-------: | :-------: |
| profile   | ose       |
| device    | emulator  |
| ip        | 127.0.0.1 |
| port      | 6622      |

- Test with default configurations.
    
    ``` shell
    $ jasmine
    ```

    or

    ``` shell
    $ jasmine --profile=ose --device=emulator --ip=127.0.0.1 --port=6622
    ```

- Test with specific configurations. (The port number can be omitted when using port 22.)

    ``` shell
    $ jasmine --profile=ose --device=webOSOSE --ip=192.168.0.12
    ```

- Test with specific port configurations.

    ``` shell
    $ jasmine --profile=ose --device=webOSOSE --ip=192.168.0.12 --port=24
    ```

- Test ares-generate command.

    ``` shell
    $ jasmine --profile=ose --device=webOSOSE --ip=192.168.0.12 --port=24 spec/jsSpec/ares-generate.js
    ```

- Test the `tv` profile. `passPhrase` must be entered as an input parameter. See [Turning Developer Mode on](https://webostv.developer.lge.com/develop/getting-started/developer-mode-app#installing-developer-mode-app).

    ``` shell
    $ jasmine --profile=tv --device=webOSTV --ip=192.168.0.12 --port=9922 --passPhrase=AB12CD
    ```

## Contributing

You can contribute your source codes to our repository.

The step-by-step guide is as follows:

1. Fork the [@webos-tools/cli repository](#). Make sure that you fork the whole repository.
2. Create a new branch from the develop branch.
3. Implement the source codes and `git push` the changes to the new branch.
4. Create a pull request. When you write the description for the pull request, make sure you follow [Pull Request Description Guidelines](#pull-request-description-guide).
5. Submit the pull request to the owner.

### Pull Request Description Guide

The following is an example of the pull reqeust description

```
Change ares-device-info to ares-device  

:Release Notes: 
Expand the scope of ares-device-info command by changing its name

:Detailed Notes:
For now, the scope of the ares-device-info command seems to narrow,
so it is hard to add other options to the command (such as capture)
- Rename ares-device-info.js to ares-device.js
- Add --system-info and --session-info options
- Update ares-device TC

:Testing Performed:
1. All unit test passed
2. ESLint done
3. Check the below commands
   $ ares-device
   $ ares-device --system-info
   $ ares-device --session-info

:Issues Addressed:
[ISSUE-1] Change ares-device-info to ares-device
```

- Summary: Describe the summary of this pull request. Make sure you capitalize the first letter of the summary.
- Release Notes: Describe what this pull request implements.
- Detailed Notes: Describe the problems of this pull request and how to fix them.
- Testing Performed: Describe tests you performed.
    - Unit test: Run CLI unit test via `jasmine` on the target device or emulator and write the result. All unit tests must be passed.
    - ESlint: Run `eslint` on @webos-tools/cli root directory and write the result. No warning or error would be allowed.
    - Detailed test steps for changes: Write commands that can test your changes. Make sure that maintainers can verify your changes using these steps.
- Issues Addressed: Write issue numbers and those summary.

## Copyright and License Information

Unless otherwise specified, all content, including all source code files and documentation files in this repository are:

Copyright (c) 2020-2024 LG Electronics, Inc.

All content, including all source code files and documentation files in this repository except otherwise noted are:

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
