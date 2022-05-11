@echo off

BuildTemplate=rtb-dms-frontend-build-configuration.yaml
DeploymentTemplate=rtb-dms-frontend-deploy-configuration.yaml

BuildConfiguration=latestBuild/build-configuration.json
DeploymentConfiguration=latestBuild/deployment-configuration.json

ToolsProjectName=rtb-dms-tools
DevProjectName=rtb-dms-dev
TestProjectName=rtb-dms-test
ProdProjectName=rtb-dms-prod


echo =============================================================================
echo Creating projects ...
echo =============================================================================
echo Creating $ToolsProjectName ...
#oc new-project $ToolsProjectName --display-name="Dispute Management System (tools)" --description="An open information system that supports the common information and workflows associated with dispute resolution (tools)"

echo Creating $DevProjectName ...
#oc new-project $DevProjectName --display-name="Dispute Management System (dev)" --description="An open information system that supports the common information and workflows associated with dispute resolution (dev)"

echo Creating $TestProjectName ...
#oc new-project $TestProjectName --display-name="Dispute Management System (test)" --description="An open information system that supports the common information and workflows associated with dispute resolution (dev)"

echo Creating $ProdProjectName ...
#oc new-project $ProdProjectName --display-name="Dispute Management System (dev)" --description="An open information system that supports the common information and workflows associated with dispute resolution (dev)"

echo =============================================================================
echo Granting the deployment projects access to the images in the tools project ...
echo =============================================================================
echo Granting access to $DevProjectName ...
oc policy add-role-to-user system:image-puller system:serviceaccount:$DevProjectName:default -n $ToolsProjectName

echo Granting access to $TestProjectName ...
oc policy add-role-to-user system:image-puller system:serviceaccount:$TestProjectName:default -n $ToolsProjectName

echo Granting access to $ProdProjectName ...
oc policy add-role-to-user system:image-puller system:serviceaccount:$ProdProjectName:default -n $ToolsProjectName

oc policy add-role-to-user edit system:serviceaccount:$ToolsProjectName:jenkins -n $DevProjectName
oc policy add-role-to-user edit system:serviceaccount:$ToolsProjectName:jenkins -n $TestProjectName
oc policy add-role-to-user edit system:serviceaccount:$ToolsProjectName:jenkins -n $ProdProjectName

echo =============================================================================
echo Configuring builds ...
echo =============================================================================
oc project $ToolsProjectName

echo Parsing the build template ...
oc process \
-f ../templates/$BuildTemplate \
 > $BuildConfiguration

echo Processing the build template ...
oc replace -f $BuildConfiguration

echo =============================================================================
echo Configuring dev deployments ...
echo =============================================================================
oc project $DevProjectName

echo Parsing the build template ...
oc process \
-f ../templates/$DeploymentTemplate \
 > $DeploymentConfiguration

echo Processing the build template ...
oc replace -f $DeploymentConfiguration

echo =============================================================================
echo Configuring test deployments ...
echo =============================================================================
oc project $TestProjectName

echo Parsing the build template ...
oc process \
-f ../templates/$DeploymentTemplate \
 > $DeploymentConfiguration

echo Processing the build template ...
oc replace -f $DeploymentConfiguration

echo =============================================================================
echo Configuring prod deployments ...
echo =============================================================================
oc project $ProdProjectName

echo Parsing the build template ...
oc process \
-f ../templates/$DeploymentTemplate \
 > $DeploymentConfiguration

echo Processing the build template ...
oc replace -f $DeploymentConfiguration
