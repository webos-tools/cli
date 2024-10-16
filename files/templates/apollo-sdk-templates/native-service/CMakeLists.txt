# Copyright (c) 2020-2024 LG Electronics, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# SPDX-License-Identifier: Apache-2.0

cmake_minimum_required(VERSION 2.8.7)
project(nativeService C)

# set link directory
#link_directories(${CMAKE_SOURCE_DIR}/pkg_$ENV{ARCH}/lib)

# ---
# add include files
include_directories(${CMAKE_SOURCE_DIR})
include_directories(${CMAKE_SOURCE_DIR}/src)
include_directories(${CMAKE_SOURCE_DIR}/include)

# ---
# find required packages
include(FindPkgConfig)

pkg_check_modules(GTHREAD2 REQUIRED gthread-2.0)
include_directories(${GTHREAD2_INCLUDE_DIRS})

pkg_check_modules(PBNJSON REQUIRED pbnjson_c)
include_directories(${PBNJSON_INCLUDE_DIRS})

# -- check for glib 2.0
pkg_check_modules(GLIB2 REQUIRED glib-2.0)
include_directories(${GLIB2_INCLUDE_DIRS})

pkg_check_modules(LS2 REQUIRED luna-service2)
include_directories(${LS2_INCLUDE_DIRS})

pkg_check_modules(PMLOG REQUIRED PmLogLib)
include_directories(${PMLOG_INCLUDE_DIRS})

# ---
# create executable file
set(BIN_NAME echo_service)

set(SRC_LIST
    ${CMAKE_SOURCE_DIR}/src/main.c
)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/pkg_$ENV{OECORE_TARGET_ARCH}/")
add_executable(${BIN_NAME} ${SRC_LIST})

# ignore shared library
set(CMAKE_EXE_LINKER_FLAGS "-Wl,--allow-shlib-undefined")
set_target_properties(${BIN_NAME} PROPERTIES LINKER_LANGUAGE C)

target_link_libraries (${BIN_NAME}
    ${GTHREAD2_LDFLAGS}
    ${PBNJSON_LDFLAGS}
    ${LS2_LDFLAGS}
    ${GLIB2_LDFLAGS}
    ${PMLOG_LDFLAGS}
)

file(COPY ${CMAKE_SOURCE_DIR}/services.json DESTINATION "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}")
