## 3.2.1 (April 2, 2025) 

### ares-package

* Fixed a bug related to the use of the `sign` and `certificate` options in `tv` profile.


## 3.2.0 (December 24, 2024) 

### ares-config

* Added support for the signage profile with the -p option.

### ares-package

* Introduced a new option: --remainPlainIPK. This option is only available for the signage profile and must be used with the --encrypt option. This option will generate an additional unencrypted IPK file in the same folder as the encrypted IPK file. The unencrypted file has the same name as the encrypted file but with the .ipk_plain extension.
* Introduced new options: --sign, and --certificate. These options are only available for the signage profile.
* Added support for exclusion by file path using the --app-exclude option.

### ares-setup-device

* Added a passphrase column to the device list table printed on the console.
* Modified the device list table to display devices in the order they were added. The newest device is now displayed at the top.
* Updated the guide for enabling Developer Mode, which is shown after adding a new device.

### ares-install

* Fixed an error that occurred while connecting to a device. It now displays the original error message instead of “Callback was already called.”

### ares-novacom

* Added support for signage profile.


## 3.1.3 (October 14, 2024)
### ares-generate
* Added "native_service" template for apollo platform.

### ares-setup-device
* Fixed a bug that device name can not be added with "-".


## 3.1.2 (August 07, 2024)
### ares-config
* Added a new apollo profile for apollo platform.

### common
* Integrated CLI commands for apollo platform.


## 3.1.1 (July 15, 2024)
### ares-inspect
* Fixed a bug that ares-inspect --service display error message on webOS TV 4.5 or lower


## 3.1.0 (July 12, 2024)
### ares-generate
* Fixed a bug that can not generate without --template option

### ares-setup-device
* Enhance usability of --add option.
* Enhance emulator remove usability
* Change default device information of TV profile (user: prisoner, port:9922)
* Change device name validation logic that accepts all characters except "$" & "%"

### common
* Upgrade node modules: shelljs(v0.8.5), async(v3.2.5), ssh2(v1.15.0), tar(v6.2.0).


## 3.0.6 (April 04, 2024)
### ares-log
* Fixed a bug that invalid json format


## 3.0.5 (April 01, 2024)
### Common
* Fixed a bug that can not install on window by CMD or Powershell


## 3.0.4 (March 30, 2024)
### Common
* Fixed a bug that always requires sudo permission when exec ares commands


## 3.0.3 (March 29, 2024)
### ares-setup-device
* Fixed a bug that the ares-setup-device of existing TV CLI is not working, after adding new target from CLI v3.0.2. If error is occurs again, please reset device list via "ares-setup-device -R" and add it again.
* Allow localhost as ip address to add target and add port validation(1-65535)

### ares-generate
* Update TV template to apply webOSTVjs v1.2.10 in ares-generate

### Common
* Update webOSTV.js to v1.2.10
* Fixed a bug that profile change is not working after installing with root on mac/linux


## 3.0.0 (March 4, 2024)
### ares-config
* Added as a new command for showing or changing the profile of CLI.

### ares-launch
* Supports to live reloading using `--hosted` option.

### ares-novacom
* Added as a new command for controlling TV devices.(This is written based on differences compared to v2.4.0.)
* Supported only when using the TV profile.

### ares-pacakge
* Fixed to minify by default for js files in service directory.

### Common
* Moved repository from @webosose/ares-cli to @webos-tools/cli.
* Integrated with the webOS TV CLI. In the future, we plan to support multiple webOS platforms with a single CLI.
* Added the profile for changing support platform, default profile is tv. The commands, options, help, and templates supported for each profile are different.
* Supports Node v16.20.2.
* Supports unit test to verify tv profile.

### Meta files
* Updated the README file.


## 2.4.0 (February 16, 2023)
### ares-device
* Supports to show node version usage using `--system-info` option.
* Fixed a bug that js service is not listed-up when ares-device `--resource-monitor --list` option.

### ares-inspect
* Updated displayed guide text during js service inspection using `--service` option.

### Common
* Supports features of below commands as APIs(total 10s)
: ares-generate, ares-inspect, ares-install, ares-launch, ares-package, ares-pull, ares-push, ares-server, ares-setup-device, ares-shell
* Added unit test to verify APIs


## 2.3.0 (February 7, 2022)
### ares-log
* Supports to show logs of pmlogd and added options to support related features.
* Added option to check(`--current-daemon`) and select(`--select-daemon`) log daemon.
* Supports to print the help message by selected log daemon.

### ares-device
* Supports to monitor resource usage using `--resouce-monitor` option and provides related features through the options of `--time-interval`, `--list`, `--id`  and `--save`.
* Fixed a bug related to the directory permission when using `capture-screen` option.

### ares-pacakge
* Supports to analyze the pacakge file(.ipk) using `--info` and `--info-detail` options.
* Fixed a bug related to the callback function error.

### ares-inspect
* Fixed a bug that prevented opening the browser specified in the environment variables when using `--open` option.

### Common
* Updated the minimum supported node version from v8.12.0 to v10.24.1.
* Added a feature to print information of the connected target device.
* Added a feature to print the progress when the command takes a long time to execute.
* Cleaned up all log levels of all source code and supports to show level-applied logs  using `--level` option of each command.
* Added a feature to manually set time interval when running unit tests.

### Meta files
* Updated the README file.


## 2.2.0 (June 21, 2021)
### ares-log
* Added as a new command for showing or saving logs of webOS apps and services.

### ares-setup-device
* Updated the naming rule for the DEVICE_NAME parameter.

### ares-install
* Enhanced the readability of the results of the --listfull option.

### Common
* Categorized error messages and added user tips according to each error message.

### Meta files
* Updated the README file.


## 2.1.0 (April 2, 2021)
### ares-device
* Supports screen capture using the `--capture-screen` option.

### ares-generate
* Updated the template of appinfo.json to apply new ACG groups. Template files generated by CLI v2.0.3 or older are not compatible with the latest webOS OSE.
* Added '/' to config method in js_service templates.

### ares-shell
* Fixed an issue that environment variables using the `ares-shell -r` command were different from environment variables of the target device.


## 2.0.3 (January 22, 2021)
### ares
* Updated help message.

### Meta files
* Updated the README file.


## 2.0.2 (December 29, 2020)
* Supports Node v14.15.1.


## 2.0.0 (December 11, 2020)
* Initial github release.
