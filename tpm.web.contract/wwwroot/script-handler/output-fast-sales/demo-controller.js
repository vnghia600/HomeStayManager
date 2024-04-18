var CreateController = function ($scope, $rootScope, $timeout, $filter, CommonFactory, UtilFactory, $q, ApiHelper, DataFactory) {   
    $scope.ddlCategory = {};
    $scope.ddlCategory.placeholder = 'Chọn ngành hàng'; 
    $scope.ddlCategory.plugins = ['checkbox', 'search', 'chkall'];
    $scope.ddlCategory.onHiddenBsDropdown = () => {
        $scope.ddlCategory.getSelected().then((x) => console.log("getSelected ", x));
    };

    UtilJS.Loading.Show();
    $q.all({ 
        wait: UtilFactory.WaitingLoadDirective([$scope.ddlCategory])
    }).then((Multiples) => {
        let data = [
            {
                "id": "1", "parent": "#", "text": "Simple root node" 
            },
            {
                "id": "2", "parent": "#", "text": "Root node 2" 
            },
            {
                "id": "3", "parent": "2", "text": "Child 1" 
            },
            {
                "id": "4", "parent": "2", "text": "Child 2" 
            },
        ];
        $scope.ddlCategory.setData(data, [1, 3]); 
        $scope.ddlCategory.dataBinding(data).then(() => { 
            $scope.ddlCategory.setSelected([1]); 
        });
         
        $timeout(() => { $rootScope.IsLoadPage = true; }, 0);
        UtilJS.Loading.Hide();
    });
}
CreateController.$inject = ["$scope", "$rootScope", "$timeout", "$filter", "CommonFactory", "UtilFactory", "$q", "ApiHelper", "DataFactory"];
addController("CreateController", CreateController);
