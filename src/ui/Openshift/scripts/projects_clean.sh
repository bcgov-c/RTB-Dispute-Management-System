ToolsProjectName=rtb-dms-tools
DevProjectName=rtb-dms-dev
TestProjectName=rtb-dms-test
ProdProjectName=rtb-dms-prod

echo =============================================================================
echo Cleaning project ...
echo =============================================================================

echo Cleaning the $ToolsProjectName build template ...
oc project $ToolsProjectName
oc delete all --selector app="case-management-ui"

echo Cleaning the $DevProjectName build template ...
oc project $DevProjectName
oc delete all --selector app="case-management-ui"

echo Cleaning the $TestProjectName build template ...
oc project $TestProjectName
oc delete all --selector app="case-management-ui"

echo Cleaning the $ProdProjectName build template ...
oc project $ProdProjectName
oc delete all --selector app="case-management-ui"
