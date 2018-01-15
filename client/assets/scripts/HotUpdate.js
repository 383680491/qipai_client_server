cc.Class({
    extends: cc.Component,

    properties: {
        panel: cc.Label,
        manifestUrl: cc.RawAsset,
        //fileProgress: cc.ProgressBar,
        //byteProgress: cc.ProgressBar,
        _updating: false,
        _canRetry: false,
        _storagePath: '',
        regeng:cc.Node
    },

    checkCb: function (event) {
        cc.log('Code: ' + event.getEventCode());
        switch (event.getEventCode())
        {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.panel.string = "没有当地的清单文件发现,热更新跳过.";
                cc.director.loadScene("start");
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                cc.director.loadScene("start");
                break;
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.panel.string = "无法下载清单文件,热更新跳过.";
                cc.director.loadScene("start");
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.panel.string = "已经更新了最新的远程版本.";
                this.regeng.active = false;
                cc.director.loadScene("start");
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                this.panel.string = "检测到更新，请更新...";
                var btnOk = cc.find("Canvas/HotUpDate/ok");
                btnOk.active = true;
                break;
            default:
                return;
        }
        cc.eventManager.removeListener(this._checkListener);
        this._checkListener = null;
        this._updating = false;
    },

    updateCb: function (event) {
        var needRestart = false;
        var failed = false;
        switch (event.getEventCode())
        {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                //this.panel.string = '没有当地的清单文件发现,热更新跳过.';
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                //this.byteProgress.progress = event.getPercent();
                //this.fileProgress.progress = event.getPercentByFile();

                //this.panel.fileLabel.string = event.getDownloadedFiles() + ' / ' + event.getTotalFiles();
                //this.panel.byteLabel.string = event.getDownloadedBytes() + ' / ' + event.getTotalBytes();

                var msg = event.getMessage();
                if (msg) {
                    //this.panel.string = '更新后的文件: ' + msg;
                    // cc.log(event.getPercent()/100 + '% : ' + msg);
                }
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.panel.string = '无法下载清单文件,热更新跳过.';
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.panel.string = '已经更新了最新的远程版本.';
                failed = true;
                this.regeng.active = false;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                this.panel.string = '更新完成了. ' + event.getMessage();
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                this.panel.string = '更新失败. ' + event.getMessage();
                //this.panel.retryBtn.active = true;
                this._updating = false;
                this._canRetry = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                this.panel.string = '资产更新错误: ' + event.getAssetId() + ', ' + event.getMessage();
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                this.panel.string = event.getMessage();
                break;
            default:
                break;
        }

        if (failed) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
            this._updating = false;
        }

        if (needRestart) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
            // Prepend the manifest's search path
            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this._am.getLocalManifest().getSearchPaths();
         //   console.log(JSON.stringify(newPaths));
            Array.prototype.unshift(searchPaths, newPaths);
            // This value will be retrieved and appended to the default search path during game startup,
            // please refer to samples/js-tests/main.js for detailed usage.
            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);

            cc.audioEngine.stopAll();
            cc.game.restart();
        }
    },

    // loadCustomManifest: function () {
    //     if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
    //         var manifest = new jsb.Manifest(customManifestStr, this._storagePath);
    //         this._am.loadLocalManifest(manifest, this._storagePath);
    //         this.panel.string = 'Using custom manifest';
    //     }
    // },
    
    retry: function () {
        if (!this._updating && this._canRetry) {
            this._canRetry = false;
            
            //this.panel.string = 'Retry failed Assets...';
            this._am.downloadFailedAssets();
        }
    },
    
    checkUpdate: function () {
        if (this._updating) {
            this.panel.string = '检查或更新 ...';
            return;
        }
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            this._am.loadLocalManifest(this.manifestUrl);
        }
        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
            this.panel.string = '未能加载本地清单 ...';
            return;
        }
        this._checkListener = new jsb.EventListenerAssetsManager(this._am, this.checkCb.bind(this));
        cc.eventManager.addListener(this._checkListener, 1);

        this._am.checkUpdate();
        this._updating = true;
    },

    hotUpdate: function () {
        if (this._am && !this._updating) {
            this._updateListener = new jsb.EventListenerAssetsManager(this._am, this.updateCb.bind(this));
            cc.eventManager.addListener(this._updateListener, 1);

            if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
                this._am.loadLocalManifest(this.manifestUrl);
            }

            this._failCount = 0;
            this._am.update();
            this._updating = true;
        }
        var btnOk = cc.find("Canvas/HotUpDate/ok");
        btnOk.active = false;
    },

    onLoad: function () {
        if(!cc.sys.isNative && cc.sys.isMobile){
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        if (!cc.sys.isNative) {
            return;
        }
        this._storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'blackjack-remote-asset');
        cc.log('存储路径为远程资产 : ' + this._storagePath);
        // Setup your own version compare handler, versionA and B is versions in string
        // if the return value greater than 0, versionA is greater than B,
        // if the return value equals 0, versionA equals to B,
        // if the return value smaller than 0, versionA is smaller than B.
        var versionCompareHandle = function (versionA, versionB) {
            cc.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
            var vA = versionA.split('.');
            var vB = versionB.split('.');
            for (var i = 0; i < vA.length; ++i) {
                var a = parseInt(vA[i]);
                var b = parseInt(vB[i] || 0);
                if (a === b) {
                    continue;
                }
                else {
                    return a - b;
                }
            }
            if (vB.length > vA.length) {
                return -1;
            }
            else {
                return 0;
            }
        };

        // Init with empty manifest url for testing custom manifest
        this._am = new jsb.AssetsManager('', this._storagePath, versionCompareHandle);
        if (!cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.retain();
        }

        //var panel = this.panel;
        // Setup the verification callback, but we don't have md5 check function yet, so only print some message
        // Return true if the verification passed, otherwise return false
        this._am.setVerifyCallback(function (path, asset) {
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            var compressed = asset.compressed;
            // Retrieve the correct md5 value.
            var expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            var relativePath = asset.path;
            // The size of asset file, but this value could be absent.
            var size = asset.size;
            if (compressed) {
                //panel.string = "验证通过了 : " + relativePath;
                return true;
            }
            else {
                //panel.string = "验证通过了 : " + relativePath + ' (' + expectedMD5 + ')';
                return true;
            }
        });

        if (cc.sys.os === cc.sys.OS_ANDROID) {
            // Some Android device may slow down the download process when concurrent tasks is too much.
            // The value may not be accurate, please do more test and find what's most suitable for your game.
            this._am.setMaxConcurrentTask(2);
            //this.panel.string = "最大并发任务数仅限于2";
        }
        //this.fileProgress.progress = 0;
        //this.byteProgress.progress = 0;
        if (this._updating) {
            this.panel.string = '检查或更新 ...';
            return;
        }
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            this._am.loadLocalManifest(this.manifestUrl);
        }
        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
            this.panel.string = '未能加载本地清单 ...';
            return;
        }
        this._checkListener = new jsb.EventListenerAssetsManager(this._am, this.checkCb.bind(this));
        cc.eventManager.addListener(this._checkListener, 1);
        this._am.checkUpdate();
        this._updating = true;
    },

    onDestroy: function () {
        if (this._updateListener) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
        }
        if (this._am && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.release();
        }
    },
});