BuildTemplate=rtb-dms-mid-tier-build-configuration.yaml
DeploymentTemplate=rtb-dms-mid-tier-deploy-configuration.yaml

BuildConfiguration=latestBuild/mid-tier-build-configuration.json
DeploymentConfiguration=latestBuild/deployment-configuration.json

ToolsProjectName=rtb-dms-tools
DevProjectName=rtb-dms-dev
TestProjectName=rtb-dms-test
ProdProjectName=rtb-dms-prod

# echo =============================================================================
# echo Creating projects ...
# echo =============================================================================
# echo Creating $ToolsProjectName ...
# oc new-project $ToolsProjectName --display-name="Dispute Management System (tools)" --description="An open information system that supports the common information and workflows associated with dispute resolution (tools)"

# echo Creating $DevProjectName ...
# oc new-project $DevProjectName --display-name="Dispute Management System (dev)" --description="An open information system that supports the common information and workflows associated with dispute resolution (dev)"

# echo Creating $TestProjectName ...
# oc new-project $TestProjectName --display-name="Dispute Management System (test)" --description="An open information system that supports the common information and workflows associated with dispute resolution (dev)"

# echo Creating $ProdProjectName ...
# oc new-project $ProdProjectName --display-name="Dispute Management System (dev)" --description="An open information system that supports the common information and workflows associated with dispute resolution (dev)"

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
oc create -f $BuildConfiguration

TAG=latest

echo
echo "Please make a selection!"
echo "1) $DevProjectName"
echo "2) $TestProjectName"
echo "3) $ProdProjectName"
echo "q) Quit"
echo

read choice

case $choice in
    'q') exit;;
    '1') oc project $DevProjectName;;
    '2') oc project $TestProjectName; TAG=release; ;;
    '3') oc project $ProdProjectName; TAG=release; ;;
    *)   echo "menu item is not available; try again!";;
esac

echo Parsing the build template ...
oc process \
-f ../templates/$DeploymentTemplate \
-p TAG=$TAG \
 > $DeploymentConfiguration

echo Processing the build template ...
oc create -f $DeploymentConfiguration