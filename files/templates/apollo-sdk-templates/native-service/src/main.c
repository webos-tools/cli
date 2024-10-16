// Copyright (c) 2020-2024 LG Electronics, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-License-Identifier: Apache-2.0

#include <stdlib.h>
#include <string.h>
#include <glib.h>
#include <stdio.h>
#include <glib-object.h>
#include <luna-service2/lunaservice.h>
#include <pbnjson.h>

// This service name
#define SERVICE_NAME "SERVICE_ID"
#define BUF_SIZE 64

// Main loop for aliving background service
GMainLoop *gmainLoop;

LSHandle  *sh = NULL;
LSMessage *message;

// Declare of each method
// All method format must be : bool function(LSHandle*, LSMessage*, void*)
bool echo(LSHandle *sh, LSMessage *message, void *data);

LSMethod sampleMethods[] = {
    {"echo", echo},   // luna://SERVICE_ID/echo
};


/*
 * Define luna://SERVICE_ID/echo
 *  - A method that always returns the same value
 *
 * +----------------------------+            +--------------------------------+
 * |   APP_ID          |            | SERVICE_ID        |
 * |   Foreground Application   |            |        Background Service      |
 * +----------------------------+            +--------------------------------+
 *   |                                                                        |
 *   |                                                                        |
 *   | 1. Request to luna://SERVICE_ID/echo                      |
 *   |    with parameters { input: "Hello, World!" }                          |
 *   |                                                                        |
 *   | ---------------------------------------------------------------------> |
 *   |                                                                        |
 *   |                                                                        |
 *   |            2. Response to APP_ID                              |
 *   |               with result '{ "echoMessage" : "Hello, World!" }'        |
 *   |                                                                        |
 *   | <--------------------------------------------------------------------- |
 *   |                                                                        |
 *  \|/                                                                      \|/
 *   '                                                                        '
 */
bool echo(LSHandle *sh, LSMessage *message, void *data)
{
    LSError lserror;
    JSchemaInfo schemaInfo;
    jvalue_ref parsed = {0}, value = {0};
    jvalue_ref jobj = {0}, jreturnValue = {0};
    const char *input = NULL;
    char buf[BUF_SIZE] = {0, };

    LSErrorInit(&lserror);

    // Initialize schema
    jschema_info_init (&schemaInfo, jschema_all(), NULL, NULL);

    // get message from LS2 and parsing to make object
    parsed = jdom_parse(j_cstr_to_buffer(LSMessageGetPayload(message)), DOMOPT_NOOPT, &schemaInfo);

    if (jis_null(parsed)) {
        j_release(&parsed);
        return true;
    }

    // Get value from payload.input
    value = jobject_get(parsed, j_cstr_to_buffer("input"));

    // JSON Object to string without schema validation check
    input = jvalue_tostring_simple(value);

    /**
     * JSON create test
     */
    jobj = jobject_create();
    if (jis_null(jobj)) {
        j_release(&jobj);
        return true;
    }

    jreturnValue = jboolean_create(TRUE);
    jobject_set(jobj, j_cstr_to_buffer("returnValue"), jreturnValue);
    jobject_set(jobj, j_cstr_to_buffer("echoMessage"), value);

    LSMessageReply(sh, message, jvalue_tostring_simple(jobj), &lserror);

    j_release(&parsed);
    return true;
}

// Register background service and initialize
int main(int argc, char* argv[])
{
    LSError lserror;
    LSHandle  *handle = NULL;
    bool bRetVal = FALSE;

    LSErrorInit(&lserror);

    // create a GMainLoop
    gmainLoop = g_main_loop_new(NULL, FALSE);

    bRetVal = LSRegister(SERVICE_NAME, &handle, &lserror);
    if (FALSE== bRetVal) {
        LSErrorFree( &lserror );
        return 0;
    }
    sh = LSMessageGetConnection(message);

    LSRegisterCategory(handle,"/",sampleMethods, NULL, NULL, &lserror);

    LSGmainAttach(handle, gmainLoop, &lserror);

    // run to check continuously for new events from each of the event sources
    g_main_loop_run(gmainLoop);
    // Decreases the reference count on a GMainLoop object by one
    g_main_loop_unref(gmainLoop);

    return 0;
}
