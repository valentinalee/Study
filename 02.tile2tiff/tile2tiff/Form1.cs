using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.IO;

using System.Net;
using System.Threading;
using System.Diagnostics;

namespace tile2tiff
{
    public partial class Form1 : Form
    {
        Random rng = new Random();
        const string SourceTail = "Galileo";
        const double EarthRadius = 6378137;
        const double MinLatitude = -85.05112878;
        const double MaxLatitude = 85.05112878;
        const double MinLongitude = -180;
        const double MaxLongitude = 180;
        const decimal EarthCircumference = 40075016.68557849m;
        const double DownloadSpeed = 30; //下载速度,张/每秒

        private string fileExt = ".jpg";

        public Form1()
        {
            InitializeComponent();
        }

        /*
        void SaveBitmapBuffered(Dataset src, Dataset dst, int x, int y)
        {
            if (src.RasterCount < 3) {
                System.Environment.Exit(-1);
            }

            // Get the GDAL Band objects from the Dataset
            Band redBand = src.GetRasterBand(1);
            Band greenBand = src.GetRasterBand(2);
            Band blueBand = src.GetRasterBand(3);

            // Get the width and height of the raster
            int width = redBand.XSize;
            int height = redBand.YSize;

            byte[] r = new byte[width * height];
            byte[] g = new byte[width * height];
            byte[] b = new byte[width * height];

            redBand.ReadRaster(0, 0, width, height, r, width, height, 0, 0);
            greenBand.ReadRaster(0, 0, width, height, g, width, height, 0, 0);
            blueBand.ReadRaster(0, 0, width, height, b, width, height, 0, 0);

            Band wrb = dst.GetRasterBand(1);
            wrb.WriteRaster(x * width, y * height, width, height, r, width, height, 0, 0);
            Band wgb = dst.GetRasterBand(2);
            wgb.WriteRaster(x * width, y * height, width, height, g, width, height, 0, 0);
            Band wbb = dst.GetRasterBand(3);
            wbb.WriteRaster(x * width, y * height, width, height, b, width, height, 0, 0);
        }
        */
        /// <summary>
        /// 拼接瓦片
        /// </summary>
        /// <param name="tilesBounds"></param>
        /// <param name="tilePath"></param>
        /// <param name="outPutFileName"></param>
        private void CombineTilesByGdal(BackgroundWorker worker,DoWorkEventArgs e)
        {
            /*
            try
            {
                WorkerParams param = e.Argument as WorkerParams;
                TilesBounds tilesBounds = param.TilesBound;
                string tilePath = param.TilePath;
                string outPutFileName = param.OutPutFileName;

                if (File.Exists(outPutFileName))
                {
                    File.Delete(outPutFileName);
                }
                int imageWidth = 256 * (tilesBounds.maxCol - tilesBounds.minCol + 1);
                int imageHeight = 256 * (tilesBounds.maxRow - tilesBounds.minRow + 1);

                //Register driver(s). 
                Gdal.AllRegister();
                OSGeo.GDAL.Gdal.SetCacheMax(1024 * 1024 * 1024);//1024M
                Driver driver = Gdal.GetDriverByName("GTiff");
                Dataset destDataset = driver.Create(outPutFileName, imageWidth, imageHeight, 3, DataType.GDT_Byte, null);


                for (int col = tilesBounds.minCol; col <= tilesBounds.maxCol; col++)
                {
                    worker.ReportProgress(col, string.Format("开始处理{0}目录图片！", col));
                    for (int row = tilesBounds.minRow; row <= tilesBounds.maxRow; row++)
                    {
                        try
                        {
                            string sourceFileName = tilePath + tilesBounds.zoomLevel.ToString() + "\\" + col.ToString() + "\\" + row.ToString() + fileExt;
                            if (File.Exists(sourceFileName))
                            {
                                Dataset sourceDataset = Gdal.Open(sourceFileName, Access.GA_ReadOnly);
                                if (sourceDataset != null)
                                {
                                    SaveBitmapBuffered(sourceDataset, destDataset, col - tilesBounds.minCol, row - tilesBounds.minRow);
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            MessageBox.Show(ex.ToString());
                        }
                    }
                }
                destDataset.Dispose();
            }catch(Exception ex){
                worker.ReportProgress(0, string.Format("合并图片生成TIFF时出现异常！msg:{0}", ex.Message));
            }
            */
        }


        private void button1_Click(object sender, EventArgs e)
        {
            clearMsg();
            DisableButton(false);
            //调用
            TilesBounds tilesBounds = GetTilesBound();

            backgroundWorker1.RunWorkerAsync(new WorkerParams { Type = 1, TilesBound = tilesBounds, OutPutFilePath = textTiffPath.Text, TilePath = textTilePath.Text });
        }

        private void btnAutoColRow_Click(object sender, EventArgs e)
        {
            clearMsg();
            textMinCol.Text = "0";
            textMaxCol.Text = "0";
            textMinRow.Text = "0";
            textMaxRow.Text = "0";
            try
            {
                string[] dirs = Directory.GetDirectories(Path.Combine(textTilePath.Text, numZoomLevel.Text));
                var dirLs = dirs.Select(s => int.Parse(Path.GetFileName(s))).OrderBy(s => s);
                textMinCol.Text = dirLs.First().ToString();
                textMaxCol.Text = dirLs.Last().ToString();
                foreach (var dir in dirs)
                {
                    string[] files = Directory.GetFiles(dir);
                    var fileLs = files.Select(s => int.Parse(Path.GetFileNameWithoutExtension(s))).OrderBy(s => s);

                    if (textMinRow.Text == "0")
                    {
                        textMinRow.Text = fileLs.First().ToString();
                    }
                    else
                    {
                        textMinRow.Text = int.Parse(textMinRow.Text) < fileLs.First() ? textMinRow.Text : fileLs.First().ToString();
                    }

                    textMaxRow.Text = int.Parse(textMaxRow.Text) > fileLs.Last() ? textMaxRow.Text : fileLs.Last().ToString();

                }
            }
            catch (Exception ex)
            {
                setMsg(ex.Message);
            }
        }

        private void btnDelWaterMark_Click(object sender, EventArgs e)
        {
            clearMsg();
            setMsg("检测可能存在误报！");
            try
            {
                string[] dirs = Directory.GetDirectories(Path.Combine(textTilePath.Text, numZoomLevel.Text)); 
                foreach (var dir in dirs)
                {
                    string[] files = Directory.GetFiles(dir);
                    foreach (var file in files)
                    {
                        FileInfo f = new FileInfo(file);
                        if (f.Length == 11186 || f.Length < 1024)
                        {
                            if (chkDelWaterMarker.Checked)
                            {
                                f.Delete();
                            }
                            setMsg(f.FullName);
                        }
                    }
                }
                
            }
            catch (Exception ex)
            {
                setMsg(ex.Message);
            }
        }

        private void btnSearchMiss_Click(object sender, EventArgs e)
        {
            clearMsg();
            TilesBounds tilesBounds = GetTilesBound();
            try
            {
                int i = 0;
                int allMissTile = 0;
                for (int col = tilesBounds.minCol; col <= tilesBounds.maxCol; col++)
                {
                    int missTileCount = 0;
                    for (int row = tilesBounds.minRow; row <= tilesBounds.maxRow; row++)
                    {
                        string sourceFileName = Path.Combine(textTilePath.Text, numZoomLevel.Text, col.ToString(), row.ToString()) + fileExt;
                        if (!File.Exists(sourceFileName))
                        {
                            string fileUrl = string.Format("http://khm{0}.google.com/kh/v=189&hl=en&x={1}&y={2}&z={3}&s={4}", i, col, row, tilesBounds.zoomLevel, 
                                SourceTail.Substring(0,rng.Next(SourceTail.Length)));
                                //sb.AppendLine(fileUrl);
                                missTileCount++;
                                allMissTile++;

                            i++;
                            i = i%4;
                        }
                    }
                    if (missTileCount > 0)
                    {
                        setMsg(string.Format("{0}:{1}", col, missTileCount));
                    }
                }
                setMsg(string.Format("Total:{0}", allMissTile));
                
            }
            catch (Exception ex)
            {
                setMsg(ex.Message);
            }
        }

        private TilesBounds GetTilesBound()
        {
            TilesBounds tilesBounds = new TilesBounds();
            tilesBounds.minCol = int.Parse(textMinCol.Text);
            tilesBounds.maxCol = int.Parse(textMaxCol.Text);
            tilesBounds.minRow = int.Parse(textMinRow.Text);
            tilesBounds.maxRow = int.Parse(textMaxRow.Text);
            tilesBounds.zoomLevel = int.Parse(numZoomLevel.Text);
            return tilesBounds;
        }

        private void DisableButton(bool enabled)
        {
            btnAutoColRow.Enabled = enabled;
            btnDelWaterMark.Enabled = enabled;
            btnDownloadMissFile.Enabled = enabled;
            btnSearchMiss.Enabled = enabled;
            btnGenerateTiFF.Enabled = enabled;
        }

        private void DownLoadMissFiles(BackgroundWorker worker,DoWorkEventArgs e)
        {
            try
            {
                WorkerParams param = e.Argument as WorkerParams;
                TilesBounds tilesBounds = param.TilesBound;
                int i = 0;
                for (int col = tilesBounds.minCol; col <= tilesBounds.maxCol; col++)
                {
                    worker.ReportProgress(col, string.Format("开始下载{0}目录图片！", col));
                    string colDir = Path.Combine(textTilePath.Text, numZoomLevel.Text, col.ToString());
                    if (!Directory.Exists(colDir))
                    {
                        Directory.CreateDirectory(colDir);
                    }
                    for (int row = tilesBounds.minRow; row <= tilesBounds.maxRow; row++)
                    {
                        if (worker.CancellationPending)
                        {
                            e.Cancel = true;
                            return;
                        }
                        string sourceFileName = Path.Combine(colDir, row.ToString()) + fileExt;
                        if (!File.Exists(sourceFileName))
                        {
                            string fileUrl = string.Empty;
                            if (param.MapType == 0)
                            {
                                fileUrl = string.Format("http://khm{0}.google.com/kh/v={5}&hl=en&x={1}&y={2}&z={3}&s={4}", i, col, row, tilesBounds.zoomLevel,
                                    SourceTail.Substring(0, rng.Next(SourceTail.Length)),param.GoogleRasterV);
                            }
                            else if (param.MapType == 1)
                            {
                                fileUrl = string.Format("http://mt{0}.google.cn/vt/lyrs=t@132&x={1}&y={2}&z={3}&s={4}", i, col, row, tilesBounds.zoomLevel,
                                    SourceTail.Substring(0, rng.Next(SourceTail.Length)));
                            }else if(param.MapType == 2){
                                fileUrl = string.Format("http://mt{0}.google.cn/vt/lyrs=m@292000000&hl=zh-CN&gl=cn&x={1}&y={2}&z={3}&s={4}", i, col, row, tilesBounds.zoomLevel,
                                    SourceTail.Substring(0, rng.Next(SourceTail.Length)));
                            }
                            else if (param.MapType == 3)
                            {
                                fileUrl = string.Format("http://10.55.13.160/ArcGIS/rest/services/water_baseMap/MapServer/tile/{3}/{2}/{1}", i, col, row, tilesBounds.zoomLevel,
                                    SourceTail.Substring(0, rng.Next(SourceTail.Length)));
                            }
                            try
                            {
                                WebClient wc = new WebClient();
                                wc.Headers.Add("user-agent", "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:21.0) Gecko/20130109 Firefox/21.0");
                                if (param.DownloadUseProxy)
                                {
                                    wc.Proxy = new WebProxy("127.0.0.1", 41080);
                                }
                                wc.DownloadFile(fileUrl, sourceFileName);
                                Thread.Sleep(10);
                            }
                            catch (Exception ex)
                            {
                                worker.ReportProgress(col, string.Format("下载图片{0}_{1}时出现错误！msg:{2} ,url:{3}",col,row,ex.Message,fileUrl));
                            }

                            i++;
                            i = i % 4;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                worker.ReportProgress(0, string.Format("下载图片时出现异常！msg:{0}",ex.Message));
            }
        }

        private void backgroundWorker1_DoWork(object sender, DoWorkEventArgs e)
        {
            BackgroundWorker worker = sender as BackgroundWorker;
            WorkerParams param = e.Argument as WorkerParams;
            if (param != null)
            {
                switch (param.Type)
                {
                    case 1:
                        CombineTilesByGdal(worker,e);
                        break;
                    case 2:
                        CombineTilesByTiffWriter(worker, e);
                        break;
                    default:
                        DownLoadMissFiles(worker, e);
                        break;
                }
            }
        }

        class WorkerParams
        {
            //执行的类型，0为下载缺失的文件，1为GDAL合并，2为TiffWriter合并
            internal int Type { get; set; }
            //下载使用代理
            internal Boolean DownloadUseProxy { get; set; }
            //下载的地图类型,0为卫星图,1为地形图
            internal int MapType { get; set; }
            //图片边界参数
            internal TilesBounds TilesBound { get; set; }
            //输出文件夹
            internal string OutPutFilePath { get; set; }
            //瓦片文件路径
            internal string TilePath { get; set; }
            //google 影像中v参数值
            internal string GoogleRasterV { get; set; }
            //生成瓦片时的文件分块数
            internal int TiffTileCount { get { return 64; } }
        }

        private void btnDownloadMissFile_Click(object sender, EventArgs e)
        {
            DisableButton(false);
            clearMsg();
            TilesBounds tilesBounds = GetTilesBound();
            backgroundWorker1.RunWorkerAsync(new WorkerParams { Type = 0, DownloadUseProxy = false, TilesBound = tilesBounds, MapType= cmbMapType.SelectedIndex,GoogleRasterV= txtGoogleRasterV.Text });
        }

        private void backgroundWorker1_ProgressChanged(object sender, ProgressChangedEventArgs e)
        {
            setMsg(string.Format("{0} {1}\r\n",DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),e.UserState.ToString()));
        }

        private void btnStop_Click(object sender, EventArgs e)
        {
            backgroundWorker1.CancelAsync();
        }

        private void backgroundWorker1_RunWorkerCompleted(object sender, RunWorkerCompletedEventArgs e)
        {
            setMsg(string.Format("{0} {1}\r\n", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),"完成！"));
            DisableButton(true);
        }

        internal class PointD
        {
            internal double X { get; set; }
            internal double Y { get; set; }
        }

        //参见：http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
        private PointD WorldToTilePos(double lon, double lat, int zoom)
        {
            PointD p = new PointD();
            p.X = ((lon + 180.0) / 360.0 * (1 << zoom));
            p.Y = ((1.0 - Math.Log(Math.Tan(lat * Math.PI / 180.0) +
                1.0 / Math.Cos(lat * Math.PI / 180.0)) / Math.PI) / 2.0 * (1 << zoom));

            return p;
        }

        private PointD TileToWorldPos(double tile_x, double tile_y, int zoom)
        {
            PointD p = new PointD();
            double n = Math.PI - ((2.0 * Math.PI * tile_y) / Math.Pow(2.0, zoom));

            p.X = ((tile_x / Math.Pow(2.0, zoom) * 360.0) - 180.0);
            p.Y = (180.0 / Math.PI * Math.Atan(Math.Sinh(n)));

            return p;
        }

        private int CorrectTileIndex(double old,int level)
        {
            return (int)Math.Min(Math.Max(0, Math.Floor(old)), ((1 << level) - 1));
        }

        private void btnLatLng2XY_Click(object sender, EventArgs e)
        {
            double minLat = double.Parse(txtMinLat.Text);
            double maxLat = double.Parse(txtMaxLat.Text);
            double minLng = double.Parse(txtMinLng.Text);
            double maxLng = double.Parse(txtMaxLng.Text);
            int level = int.Parse(numZoomLevel.Text);

            PointD minP = WorldToTilePos(minLng, minLat, level);
            PointD maxP = WorldToTilePos(maxLng, maxLat, level);

            //min取整数部分，max取
            textMinCol.Text = CorrectTileIndex(minP.X, level).ToString();
            textMaxCol.Text = CorrectTileIndex(maxP.X, level).ToString();
            textMinRow.Text = CorrectTileIndex(maxP.Y, level).ToString(); //y的序号相反
            textMaxRow.Text = CorrectTileIndex(minP.Y, level).ToString();

            double tile_count = (maxP.X - minP.X) * (minP.Y - maxP.Y);
            double down_time = tile_count / DownloadSpeed /60 /60; //小时

            setMsg(string.Format("瓦片总数：{0} ,下载需约{1}小时({2}天,下载速度：{3}张/秒)",tile_count, down_time, down_time/24,DownloadSpeed));
        }

        private void btnXY2LatLng_Click(object sender, EventArgs e)
        {
            int minX = int.Parse(textMinCol.Text);
            int maxX = int.Parse(textMaxCol.Text);
            int minY = int.Parse(textMinRow.Text);
            int maxY = int.Parse(textMaxRow.Text);
            int level = int.Parse(numZoomLevel.Text);

            //计算边界时，xy的最大编号需要加1

            PointD minP = TileToWorldPos(minX, maxY + 1, level);
            PointD maxP = TileToWorldPos(maxX + 1, minY, level);

            PointD p3 = TileToWorldPos(minX, minY, level);
            PointD p4 = TileToWorldPos(maxX + 1, maxY+1, level);

            txtMinLat.Text = minP.Y.ToString();
            txtMaxLat.Text = maxP.Y.ToString();
            txtMinLng.Text = minP.X.ToString();
            txtMaxLng.Text = maxP.X.ToString();

            StringBuilder sb = new StringBuilder();
            sb.AppendFormat("左上角(X:{0} Y:{1})", p3.X, p3.Y);
            sb.AppendLine();
            sb.AppendFormat("右上角(X:{0} Y:{1})", maxP.X, maxP.Y);
            sb.AppendLine();
            sb.AppendFormat("右下角(X:{0} Y:{1})", p4.X, p4.Y);
            sb.AppendLine();
            sb.AppendFormat("左下角(X:{0} Y:{1})", minP.X, minP.Y);
            sb.AppendLine();
            setMsg(sb.ToString());
        }

        private string irfanViewPath = "D:\\app\\IrfanView\\i_view32.exe";
        private int ivProcessCount = 0;

        private void btnGenPNG_Click(object sender, EventArgs e)
        {
            clearMsg();
            TilesBounds tilesBounds = GetTilesBound();
            StringBuilder cmdBuilder = new StringBuilder();
            string outPath = textTiffPath.Text;
            try
            {
                string tmpPath = outPath + "_tmp";
                Directory.CreateDirectory(tmpPath);
                setMsg("开始合并png图片！");
                ivProcessCount = tilesBounds.maxCol - tilesBounds.minCol + 1;
                for (int col = tilesBounds.minCol; col <= tilesBounds.maxCol; col++)
                {
                    string picPath = Path.Combine(textTilePath.Text, numZoomLevel.Text, col.ToString(), "*" + fileExt);
                    string outPngfile = Path.Combine(tmpPath, col + ".png");
                    string cmd = string.Format("/panorama=(2,{0}) /convert={1}", picPath, outPngfile);

                    Process ivProcess = new Process();
                    ivProcess.EnableRaisingEvents = true;
                    ivProcess.StartInfo.FileName = irfanViewPath;
                    ivProcess.StartInfo.Arguments = cmd;
                    ivProcess.Exited += ivProcess_Exited;
                    ivProcess.Start();
                }

            }
            catch (Exception ex)
            {
                setMsg(ex.Message);
            }
        }
        public delegate void SetTextCallback(String msg);

        void setMsg(string msg)
        {
            if (this.listBox1.InvokeRequired)
            {
                SetTextCallback d = new SetTextCallback(setMsg);
                this.Invoke(d, new object[] { msg });
            }
            else
            {
                if(this.listBox1.Items.Count > 1000)
                {
                    this.listBox1.Items.RemoveAt(0);
                }
                this.listBox1.Items.Add(string.Format("{0} {1}\r\n", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"), msg));
            }
        }
        void clearMsg()
        {
            this.listBox1.Items.Clear();
        }


        void ivProcess_Exited(object sender, EventArgs e)
        {
            string outPath = textTiffPath.Text;
            string tmpPath = outPath + "_tmp";
            TilesBounds tilesBounds = GetTilesBound();
            lock (this)
            {
                ivProcessCount--;
                if (ivProcessCount == 0)
                {
                    setMsg("完成行合并，开始进行列合并！");
                    string arguments = string.Format("/panorama=(1,{0}) /convert={1}", Path.Combine(tmpPath, "*.png"), outPath);
                    Process p = new Process();
                    p.EnableRaisingEvents = true;
                    p.StartInfo.FileName = irfanViewPath;
                    p.StartInfo.Arguments = arguments;
                    p.Exited += ivProcess_Exited;
                    p.Start();
                    p.Exited += p_Exited;
                }
            }
        }

        void p_Exited(object sender, EventArgs e)
        {
            string outPath = textTiffPath.Text;
            string tmpPath = outPath + "_tmp";
            setMsg("合成png文件完成！\r\n");
            if (MessageBox.Show("删除临时文件？", "确认", MessageBoxButtons.YesNo) == DialogResult.Yes)
            {
                Directory.Delete(tmpPath, true);
            }
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            cmbMapType.SelectedIndex = 0;
        }

        private void WriteTfwFile(TilesBounds tilesBounds, string outTfwFileName)
        {
            StringBuilder sb = new StringBuilder();

            decimal resolution = EarthCircumference / 256 / (decimal)Math.Pow(2, tilesBounds.zoomLevel);
            

            //EPSG:3857
            sb.AppendLine(resolution.ToString());//X方向上的象素分辨素
            sb.AppendLine("0");//X方向的旋转系数
            sb.AppendLine("0");//Y方向的旋转系数
            sb.AppendLine( "-" + resolution.ToString());//Y方向上的象素分辨率
            sb.AppendLine(((tilesBounds.minCol * 256m + 0.5m) * resolution - EarthCircumference / 2).ToString());//左上角象素中心X坐标
            sb.AppendLine((EarthCircumference / 2 - (tilesBounds.minRow * 256m + 0.5m) * resolution).ToString());//左上角象素中心Y坐标

            /* EPSG:4326
            int imageWidth = 256 * (tilesBounds.maxCol - tilesBounds.minCol + 1);
            int imageHeight = 256 * (tilesBounds.maxRow - tilesBounds.minRow + 1);

            PointD p1 = TileToWorldPos(tilesBounds.minCol,tilesBounds.minRow,tilesBounds.zoomLevel); //左上
            PointD p2 = TileToWorldPos(tilesBounds.maxCol + 1, tilesBounds.maxRow + 1, tilesBounds.zoomLevel);//右下

            sb.AppendLine(((p2.X - p1.X) / imageWidth).ToString());//X方向上的象素分辨素
            sb.AppendLine("0");//X方向的旋转系数
            sb.AppendLine("0");//Y方向的旋转系数
            sb.AppendLine(((p2.Y - p1.Y) / imageHeight).ToString());//Y方向上的象素分辨率
            sb.AppendLine((p1.X).ToString());//左上角象素中心X坐标
            sb.AppendLine((p1.Y).ToString());//左上角象素中心Y坐标
            */

            File.WriteAllText(outTfwFileName,sb.ToString());
        }

        /// <summary>
        /// 拼接瓦片
        /// </summary>
        /// <param name="tilesBounds"></param>
        /// <param name="tilePath"></param>
        /// <param name="outPutFileName"></param>
        private void CombineTilesByTiffWriter(BackgroundWorker worker, DoWorkEventArgs e)
        {
            try
            {
                WorkerParams param = e.Argument as WorkerParams;
                TilesBounds tb = param.TilesBound;
                string tilePath = param.TilePath;
                string outPutFilePath = param.OutPutFilePath;

                int minBlockColIdx = tb.minCol / param.TiffTileCount;
                int maxBlockColIdx = tb.maxCol / param.TiffTileCount;
                int minBlockRowIdx = tb.minRow / param.TiffTileCount;
                int maxBlockRowIdx = tb.maxRow / param.TiffTileCount;

                int totalFileCount = (maxBlockColIdx - minBlockColIdx + 1) * (maxBlockRowIdx - minBlockRowIdx + 1);
                worker.ReportProgress(0, string.Format("生成的TIFF共有{0}个，总大小估计为：{1} G", totalFileCount, totalFileCount * 0.75));
                for (int i = minBlockColIdx; i <= maxBlockColIdx; i++)
                {
                    for (int j = minBlockRowIdx; j <= maxBlockRowIdx; j++)
                    {
                        if (worker.CancellationPending)
                        {
                            e.Cancel = true;
                            return;
                        }

                        TilesBounds tilesBounds = new TilesBounds();
                        tilesBounds.zoomLevel = tb.zoomLevel;
                        //修正瓦片边界，防止周围黑边
                        tilesBounds.minCol = Math.Max(i * param.TiffTileCount,tb.minCol);
                        tilesBounds.maxCol = Math.Min(i * param.TiffTileCount + param.TiffTileCount - 1,tb.maxCol);
                        tilesBounds.minRow = Math.Max(j * param.TiffTileCount,tb.minRow);
                        tilesBounds.maxRow = Math.Min(j * param.TiffTileCount + param.TiffTileCount - 1,tb.maxRow);

                        CombineSingleTiff(worker, tilesBounds, tilePath, outPutFilePath);
                    }

                }

            }
            catch (Exception ex)
            {
                worker.ReportProgress(0, string.Format("合并图片生成TIFF时出现异常！msg:{0}", ex.Message));
            }

        }

        //合并单个Tiff文件
        private void CombineSingleTiff(BackgroundWorker worker, TilesBounds tilesBounds, string tilePath, string outPutFilePath)
        {
            string outPutFileName = Path.Combine(outPutFilePath, string.Format("x{2}-{3}_y{0}-{1}.tif", tilesBounds.minRow, tilesBounds.maxRow, tilesBounds.minCol, tilesBounds.maxCol));

            worker.ReportProgress(tilesBounds.minCol, string.Format("开始生成TIFF文件：{0}", outPutFileName));
            if (File.Exists(outPutFileName))
            {
                //存在则跳过
                return;
            }
            int imageWidth = 256 * (tilesBounds.maxCol - tilesBounds.minCol + 1);
            int imageHeight = 256 * (tilesBounds.maxRow - tilesBounds.minRow + 1);

            TiffFileWriter writer = new TiffFileWriter();

            writer.CreateFile(outPutFileName, (uint)imageWidth, (uint)imageHeight);

            writer.WriteTiffHeader();

            for (int row = tilesBounds.minRow; row <= tilesBounds.maxRow; row++)
            {
                List<Bitmap> bitmapLs = new List<Bitmap>(tilesBounds.maxCol - tilesBounds.minCol + 1);
                try
                {
                    for (int col = tilesBounds.minCol; col <= tilesBounds.maxCol; col++)
                    {
                        string sourceFileName = Path.Combine(tilePath, tilesBounds.zoomLevel.ToString(), col.ToString(), row.ToString() + fileExt);
                        if (File.Exists(sourceFileName))
                        {
                            bitmapLs.Add(new Bitmap(sourceFileName));
                        }
                        else
                        {
                            bitmapLs.Add(new Bitmap(256, 256));
                        }
                    }
                    writer.WriteImageData(bitmapLs);
                }
                catch (Exception ex)
                {
                    MessageBox.Show(ex.ToString());
                }
            }

            writer.CloseFile();

            string outTfwFileName = Path.Combine(outPutFilePath, Path.GetFileNameWithoutExtension(outPutFileName) + ".tfw");
            WriteTfwFile(tilesBounds, outTfwFileName);
        }

        private void btnGenerateTiFF_Click(object sender, EventArgs e)
        {

            clearMsg();
            DisableButton(false);
            //调用
            TilesBounds tilesBounds = GetTilesBound();

            backgroundWorker1.RunWorkerAsync(new WorkerParams { Type = 2, TilesBound = tilesBounds, OutPutFilePath = textTiffPath.Text, TilePath = textTilePath.Text });
        }

        private void btnChina_Click(object sender, EventArgs e)
        {
            txtMinLng.Text = "73";
            txtMaxLng.Text = "136";
            txtMinLat.Text = "17";
            txtMaxLat.Text = "55";
        }

        private void btnCQ_Click(object sender, EventArgs e)
        {
            txtMinLng.Text = "105.5";
            txtMaxLng.Text = "106.70";
            txtMinLat.Text = "29.7";
            txtMaxLat.Text = "30.45";
        }

        private void listBox1_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (this.listBox1.SelectedItem != null)
            {
                Clipboard.SetDataObject(this.listBox1.SelectedItem.ToString());
            }
        }
    }
}
