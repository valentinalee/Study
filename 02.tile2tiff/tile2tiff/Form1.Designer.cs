namespace tile2tiff
{
    partial class Form1
    {
        /// <summary>
        /// 必需的设计器变量。
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// 清理所有正在使用的资源。
        /// </summary>
        /// <param name="disposing">如果应释放托管资源，为 true；否则为 false。</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows 窗体设计器生成的代码

        /// <summary>
        /// 设计器支持所需的方法 - 不要
        /// 使用代码编辑器修改此方法的内容。
        /// </summary>
        private void InitializeComponent()
        {
            this.label1 = new System.Windows.Forms.Label();
            this.textTilePath = new System.Windows.Forms.TextBox();
            this.textTiffPath = new System.Windows.Forms.TextBox();
            this.label2 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.textMinCol = new System.Windows.Forms.TextBox();
            this.label4 = new System.Windows.Forms.Label();
            this.textMaxCol = new System.Windows.Forms.TextBox();
            this.textMaxRow = new System.Windows.Forms.TextBox();
            this.textMinRow = new System.Windows.Forms.TextBox();
            this.label5 = new System.Windows.Forms.Label();
            this.btnAutoColRow = new System.Windows.Forms.Button();
            this.btnDelWaterMark = new System.Windows.Forms.Button();
            this.btnSearchMiss = new System.Windows.Forms.Button();
            this.groupBox1 = new System.Windows.Forms.GroupBox();
            this.listBox1 = new System.Windows.Forms.ListBox();
            this.numZoomLevel = new System.Windows.Forms.NumericUpDown();
            this.backgroundWorker1 = new System.ComponentModel.BackgroundWorker();
            this.btnDownloadMissFile = new System.Windows.Forms.Button();
            this.btnStop = new System.Windows.Forms.Button();
            this.chkDelWaterMarker = new System.Windows.Forms.CheckBox();
            this.txtMaxLat = new System.Windows.Forms.TextBox();
            this.txtMinLat = new System.Windows.Forms.TextBox();
            this.label6 = new System.Windows.Forms.Label();
            this.txtMaxLng = new System.Windows.Forms.TextBox();
            this.txtMinLng = new System.Windows.Forms.TextBox();
            this.label7 = new System.Windows.Forms.Label();
            this.btnLatLng2XY = new System.Windows.Forms.Button();
            this.btnXY2LatLng = new System.Windows.Forms.Button();
            this.cmbMapType = new System.Windows.Forms.ComboBox();
            this.label8 = new System.Windows.Forms.Label();
            this.btnGenerateTiFF = new System.Windows.Forms.Button();
            this.txtGoogleRasterV = new System.Windows.Forms.TextBox();
            this.btnChina = new System.Windows.Forms.Button();
            this.btnCQ = new System.Windows.Forms.Button();
            this.groupBox1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.numZoomLevel)).BeginInit();
            this.SuspendLayout();
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(13, 54);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(89, 12);
            this.label1.TabIndex = 1;
            this.label1.Text = "瓦片文件目录：";
            // 
            // textTilePath
            // 
            this.textTilePath.Location = new System.Drawing.Point(104, 48);
            this.textTilePath.Name = "textTilePath";
            this.textTilePath.Size = new System.Drawing.Size(226, 21);
            this.textTilePath.TabIndex = 2;
            this.textTilePath.Text = "e:\\data\\3dwebgis\\Cesium\\g_map_raster\\gmap_data\\";
            // 
            // textTiffPath
            // 
            this.textTiffPath.Location = new System.Drawing.Point(104, 75);
            this.textTiffPath.Name = "textTiffPath";
            this.textTiffPath.Size = new System.Drawing.Size(226, 21);
            this.textTiffPath.TabIndex = 5;
            this.textTiffPath.Text = "e:\\data\\gmap_tiff\\12\\";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(13, 81);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(89, 12);
            this.label2.TabIndex = 4;
            this.label2.Text = "TIFF文件路径：";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(13, 108);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(71, 12);
            this.label3.TabIndex = 7;
            this.label3.Text = "zoomLevel：";
            // 
            // textMinCol
            // 
            this.textMinCol.Location = new System.Drawing.Point(104, 129);
            this.textMinCol.Name = "textMinCol";
            this.textMinCol.Size = new System.Drawing.Size(84, 21);
            this.textMinCol.TabIndex = 10;
            this.textMinCol.Text = "2878";
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(13, 135);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(35, 12);
            this.label4.TabIndex = 9;
            this.label4.Text = "Col：";
            // 
            // textMaxCol
            // 
            this.textMaxCol.Location = new System.Drawing.Point(246, 129);
            this.textMaxCol.Name = "textMaxCol";
            this.textMaxCol.Size = new System.Drawing.Size(84, 21);
            this.textMaxCol.TabIndex = 11;
            this.textMaxCol.Text = "3595";
            // 
            // textMaxRow
            // 
            this.textMaxRow.Location = new System.Drawing.Point(246, 156);
            this.textMaxRow.Name = "textMaxRow";
            this.textMaxRow.Size = new System.Drawing.Size(84, 21);
            this.textMaxRow.TabIndex = 14;
            this.textMaxRow.Text = "1851";
            // 
            // textMinRow
            // 
            this.textMinRow.Location = new System.Drawing.Point(104, 156);
            this.textMinRow.Name = "textMinRow";
            this.textMinRow.Size = new System.Drawing.Size(84, 21);
            this.textMinRow.TabIndex = 13;
            this.textMinRow.Text = "1295";
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Location = new System.Drawing.Point(13, 162);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(35, 12);
            this.label5.TabIndex = 12;
            this.label5.Text = "Row：";
            // 
            // btnAutoColRow
            // 
            this.btnAutoColRow.Location = new System.Drawing.Point(414, 10);
            this.btnAutoColRow.Name = "btnAutoColRow";
            this.btnAutoColRow.Size = new System.Drawing.Size(75, 23);
            this.btnAutoColRow.TabIndex = 15;
            this.btnAutoColRow.Text = "自动行列";
            this.btnAutoColRow.UseVisualStyleBackColor = true;
            this.btnAutoColRow.Click += new System.EventHandler(this.btnAutoColRow_Click);
            // 
            // btnDelWaterMark
            // 
            this.btnDelWaterMark.Location = new System.Drawing.Point(503, 45);
            this.btnDelWaterMark.Name = "btnDelWaterMark";
            this.btnDelWaterMark.Size = new System.Drawing.Size(75, 23);
            this.btnDelWaterMark.TabIndex = 16;
            this.btnDelWaterMark.Text = "查找问题图片";
            this.btnDelWaterMark.UseVisualStyleBackColor = true;
            this.btnDelWaterMark.Click += new System.EventHandler(this.btnDelWaterMark_Click);
            // 
            // btnSearchMiss
            // 
            this.btnSearchMiss.Location = new System.Drawing.Point(503, 13);
            this.btnSearchMiss.Name = "btnSearchMiss";
            this.btnSearchMiss.Size = new System.Drawing.Size(88, 23);
            this.btnSearchMiss.TabIndex = 19;
            this.btnSearchMiss.Text = "查找缺失图片";
            this.btnSearchMiss.UseVisualStyleBackColor = true;
            this.btnSearchMiss.Click += new System.EventHandler(this.btnSearchMiss_Click);
            // 
            // groupBox1
            // 
            this.groupBox1.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.groupBox1.Controls.Add(this.listBox1);
            this.groupBox1.Location = new System.Drawing.Point(15, 183);
            this.groupBox1.Name = "groupBox1";
            this.groupBox1.Size = new System.Drawing.Size(932, 339);
            this.groupBox1.TabIndex = 22;
            this.groupBox1.TabStop = false;
            this.groupBox1.Text = "消息";
            // 
            // listBox1
            // 
            this.listBox1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.listBox1.FormattingEnabled = true;
            this.listBox1.ItemHeight = 12;
            this.listBox1.Location = new System.Drawing.Point(3, 17);
            this.listBox1.Name = "listBox1";
            this.listBox1.Size = new System.Drawing.Size(926, 319);
            this.listBox1.TabIndex = 0;
            this.listBox1.SelectedIndexChanged += new System.EventHandler(this.listBox1_SelectedIndexChanged);
            // 
            // numZoomLevel
            // 
            this.numZoomLevel.Location = new System.Drawing.Point(104, 102);
            this.numZoomLevel.Maximum = new decimal(new int[] {
            21,
            0,
            0,
            0});
            this.numZoomLevel.Name = "numZoomLevel";
            this.numZoomLevel.Size = new System.Drawing.Size(226, 21);
            this.numZoomLevel.TabIndex = 23;
            this.numZoomLevel.Value = new decimal(new int[] {
            12,
            0,
            0,
            0});
            // 
            // backgroundWorker1
            // 
            this.backgroundWorker1.WorkerReportsProgress = true;
            this.backgroundWorker1.WorkerSupportsCancellation = true;
            this.backgroundWorker1.DoWork += new System.ComponentModel.DoWorkEventHandler(this.backgroundWorker1_DoWork);
            this.backgroundWorker1.ProgressChanged += new System.ComponentModel.ProgressChangedEventHandler(this.backgroundWorker1_ProgressChanged);
            this.backgroundWorker1.RunWorkerCompleted += new System.ComponentModel.RunWorkerCompletedEventHandler(this.backgroundWorker1_RunWorkerCompleted);
            // 
            // btnDownloadMissFile
            // 
            this.btnDownloadMissFile.Location = new System.Drawing.Point(414, 84);
            this.btnDownloadMissFile.Name = "btnDownloadMissFile";
            this.btnDownloadMissFile.Size = new System.Drawing.Size(97, 23);
            this.btnDownloadMissFile.TabIndex = 25;
            this.btnDownloadMissFile.Text = "下载缺失图片";
            this.btnDownloadMissFile.UseVisualStyleBackColor = true;
            this.btnDownloadMissFile.Click += new System.EventHandler(this.btnDownloadMissFile_Click);
            // 
            // btnStop
            // 
            this.btnStop.Location = new System.Drawing.Point(517, 84);
            this.btnStop.Name = "btnStop";
            this.btnStop.Size = new System.Drawing.Size(75, 23);
            this.btnStop.TabIndex = 26;
            this.btnStop.Text = "停止";
            this.btnStop.UseVisualStyleBackColor = true;
            this.btnStop.Click += new System.EventHandler(this.btnStop_Click);
            // 
            // chkDelWaterMarker
            // 
            this.chkDelWaterMarker.AutoSize = true;
            this.chkDelWaterMarker.Location = new System.Drawing.Point(414, 45);
            this.chkDelWaterMarker.Name = "chkDelWaterMarker";
            this.chkDelWaterMarker.Size = new System.Drawing.Size(48, 16);
            this.chkDelWaterMarker.TabIndex = 27;
            this.chkDelWaterMarker.Text = "删除";
            this.chkDelWaterMarker.UseVisualStyleBackColor = true;
            // 
            // txtMaxLat
            // 
            this.txtMaxLat.Location = new System.Drawing.Point(799, 72);
            this.txtMaxLat.Name = "txtMaxLat";
            this.txtMaxLat.Size = new System.Drawing.Size(119, 21);
            this.txtMaxLat.TabIndex = 33;
            this.txtMaxLat.Text = "55";
            // 
            // txtMinLat
            // 
            this.txtMinLat.Location = new System.Drawing.Point(657, 72);
            this.txtMinLat.Name = "txtMinLat";
            this.txtMinLat.Size = new System.Drawing.Size(119, 21);
            this.txtMinLat.TabIndex = 32;
            this.txtMinLat.Text = "17";
            // 
            // label6
            // 
            this.label6.AutoSize = true;
            this.label6.Location = new System.Drawing.Point(613, 78);
            this.label6.Name = "label6";
            this.label6.Size = new System.Drawing.Size(41, 12);
            this.label6.TabIndex = 31;
            this.label6.Text = "纬度：";
            // 
            // txtMaxLng
            // 
            this.txtMaxLng.Location = new System.Drawing.Point(799, 45);
            this.txtMaxLng.Name = "txtMaxLng";
            this.txtMaxLng.Size = new System.Drawing.Size(119, 21);
            this.txtMaxLng.TabIndex = 30;
            this.txtMaxLng.Text = "136";
            // 
            // txtMinLng
            // 
            this.txtMinLng.Location = new System.Drawing.Point(657, 45);
            this.txtMinLng.Name = "txtMinLng";
            this.txtMinLng.Size = new System.Drawing.Size(119, 21);
            this.txtMinLng.TabIndex = 29;
            this.txtMinLng.Text = "73";
            // 
            // label7
            // 
            this.label7.AutoSize = true;
            this.label7.Location = new System.Drawing.Point(613, 48);
            this.label7.Name = "label7";
            this.label7.Size = new System.Drawing.Size(41, 12);
            this.label7.TabIndex = 28;
            this.label7.Text = "经度：";
            // 
            // btnLatLng2XY
            // 
            this.btnLatLng2XY.Location = new System.Drawing.Point(657, 111);
            this.btnLatLng2XY.Name = "btnLatLng2XY";
            this.btnLatLng2XY.Size = new System.Drawing.Size(75, 23);
            this.btnLatLng2XY.TabIndex = 34;
            this.btnLatLng2XY.Text = "经纬转XY";
            this.btnLatLng2XY.UseVisualStyleBackColor = true;
            this.btnLatLng2XY.Click += new System.EventHandler(this.btnLatLng2XY_Click);
            // 
            // btnXY2LatLng
            // 
            this.btnXY2LatLng.Location = new System.Drawing.Point(799, 111);
            this.btnXY2LatLng.Name = "btnXY2LatLng";
            this.btnXY2LatLng.Size = new System.Drawing.Size(75, 23);
            this.btnXY2LatLng.TabIndex = 35;
            this.btnXY2LatLng.Text = "XY转经纬";
            this.btnXY2LatLng.UseVisualStyleBackColor = true;
            this.btnXY2LatLng.Click += new System.EventHandler(this.btnXY2LatLng_Click);
            // 
            // cmbMapType
            // 
            this.cmbMapType.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.cmbMapType.FormattingEnabled = true;
            this.cmbMapType.Items.AddRange(new object[] {
            "google卫星地图(无偏移)",
            "google地形地图(无注记)",
            "google街道地图",
            "water_baseMap"});
            this.cmbMapType.Location = new System.Drawing.Point(104, 12);
            this.cmbMapType.Name = "cmbMapType";
            this.cmbMapType.Size = new System.Drawing.Size(226, 20);
            this.cmbMapType.TabIndex = 37;
            // 
            // label8
            // 
            this.label8.AutoSize = true;
            this.label8.Location = new System.Drawing.Point(19, 18);
            this.label8.Name = "label8";
            this.label8.Size = new System.Drawing.Size(65, 12);
            this.label8.TabIndex = 38;
            this.label8.Text = "地图类型：";
            // 
            // btnGenerateTiFF
            // 
            this.btnGenerateTiFF.Location = new System.Drawing.Point(414, 127);
            this.btnGenerateTiFF.Name = "btnGenerateTiFF";
            this.btnGenerateTiFF.Size = new System.Drawing.Size(75, 23);
            this.btnGenerateTiFF.TabIndex = 39;
            this.btnGenerateTiFF.Text = "生成TIFF";
            this.btnGenerateTiFF.UseVisualStyleBackColor = true;
            this.btnGenerateTiFF.Click += new System.EventHandler(this.btnGenerateTiFF_Click);
            // 
            // txtGoogleRasterV
            // 
            this.txtGoogleRasterV.Location = new System.Drawing.Point(337, 11);
            this.txtGoogleRasterV.Name = "txtGoogleRasterV";
            this.txtGoogleRasterV.Size = new System.Drawing.Size(41, 21);
            this.txtGoogleRasterV.TabIndex = 40;
            this.txtGoogleRasterV.Text = "200";
            // 
            // btnChina
            // 
            this.btnChina.Location = new System.Drawing.Point(657, 13);
            this.btnChina.Name = "btnChina";
            this.btnChina.Size = new System.Drawing.Size(44, 23);
            this.btnChina.TabIndex = 41;
            this.btnChina.Text = "全国";
            this.btnChina.UseVisualStyleBackColor = true;
            this.btnChina.Click += new System.EventHandler(this.btnChina_Click);
            // 
            // btnCQ
            // 
            this.btnCQ.Location = new System.Drawing.Point(707, 12);
            this.btnCQ.Name = "btnCQ";
            this.btnCQ.Size = new System.Drawing.Size(44, 23);
            this.btnCQ.TabIndex = 42;
            this.btnCQ.Text = "重庆";
            this.btnCQ.UseVisualStyleBackColor = true;
            this.btnCQ.Click += new System.EventHandler(this.btnCQ_Click);
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(959, 515);
            this.Controls.Add(this.btnCQ);
            this.Controls.Add(this.btnChina);
            this.Controls.Add(this.txtGoogleRasterV);
            this.Controls.Add(this.btnGenerateTiFF);
            this.Controls.Add(this.label8);
            this.Controls.Add(this.cmbMapType);
            this.Controls.Add(this.btnXY2LatLng);
            this.Controls.Add(this.btnLatLng2XY);
            this.Controls.Add(this.txtMaxLat);
            this.Controls.Add(this.txtMinLat);
            this.Controls.Add(this.label6);
            this.Controls.Add(this.txtMaxLng);
            this.Controls.Add(this.txtMinLng);
            this.Controls.Add(this.label7);
            this.Controls.Add(this.chkDelWaterMarker);
            this.Controls.Add(this.btnStop);
            this.Controls.Add(this.btnDownloadMissFile);
            this.Controls.Add(this.numZoomLevel);
            this.Controls.Add(this.groupBox1);
            this.Controls.Add(this.btnSearchMiss);
            this.Controls.Add(this.btnDelWaterMark);
            this.Controls.Add(this.btnAutoColRow);
            this.Controls.Add(this.textMaxRow);
            this.Controls.Add(this.textMinRow);
            this.Controls.Add(this.label5);
            this.Controls.Add(this.textMaxCol);
            this.Controls.Add(this.textMinCol);
            this.Controls.Add(this.label4);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.textTiffPath);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.textTilePath);
            this.Controls.Add(this.label1);
            this.Name = "Form1";
            this.Text = "GMap瓦片处理";
            this.Load += new System.EventHandler(this.Form1_Load);
            this.groupBox1.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.numZoomLevel)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.TextBox textTilePath;
        private System.Windows.Forms.TextBox textTiffPath;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.TextBox textMinCol;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.TextBox textMaxCol;
        private System.Windows.Forms.TextBox textMaxRow;
        private System.Windows.Forms.TextBox textMinRow;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.Button btnAutoColRow;
        private System.Windows.Forms.Button btnDelWaterMark;
        private System.Windows.Forms.Button btnSearchMiss;
        private System.Windows.Forms.GroupBox groupBox1;
        private System.Windows.Forms.NumericUpDown numZoomLevel;
        private System.ComponentModel.BackgroundWorker backgroundWorker1;
        private System.Windows.Forms.Button btnDownloadMissFile;
        private System.Windows.Forms.Button btnStop;
        private System.Windows.Forms.CheckBox chkDelWaterMarker;
        private System.Windows.Forms.TextBox txtMaxLat;
        private System.Windows.Forms.TextBox txtMinLat;
        private System.Windows.Forms.Label label6;
        private System.Windows.Forms.TextBox txtMaxLng;
        private System.Windows.Forms.TextBox txtMinLng;
        private System.Windows.Forms.Label label7;
        private System.Windows.Forms.Button btnLatLng2XY;
        private System.Windows.Forms.Button btnXY2LatLng;
        private System.Windows.Forms.ComboBox cmbMapType;
        private System.Windows.Forms.Label label8;
        private System.Windows.Forms.Button btnGenerateTiFF;
        private System.Windows.Forms.TextBox txtGoogleRasterV;
        private System.Windows.Forms.Button btnChina;
        private System.Windows.Forms.Button btnCQ;
        private System.Windows.Forms.ListBox listBox1;
    }
}

