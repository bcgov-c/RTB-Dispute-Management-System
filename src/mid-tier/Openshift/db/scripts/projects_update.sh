DeploymentTemplate=rtb-dms-mid-tier-db-deploy-configuration.yaml

DeploymentConfiguration=latestBuild/deployment-configuration.json

ToolsProjectName=rtb-dms-tools
DevProjectName=rtb-dms-dev
TestProjectName=rtb-dms-test
ProdProjectName=rtb-dms-prod

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
 > $DeploymentConfiguration

echo Processing the build template ...
oc replace -f $DeploymentConfiguration
