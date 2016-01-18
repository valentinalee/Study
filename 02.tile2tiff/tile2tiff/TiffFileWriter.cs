using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace tile2tiff
{
    /// <summary>
    /// Tiff 图像文件头Image File Header(IFH)
    /// </summary>
    [StructLayout(LayoutKind.Sequential)]
    public struct TiffImageFileHeader
    {
        public ushort ByteOrder;//字节顺序标志位， 值为II或者MM。II表示小字节在前， 又称为little-endian。MM表示大字节在前，又成为big-endian。
        public ushort Marker;//TIFF的标志位，0x002A
        public uint FirstIFD;//第一个IFD的偏移量。可以在任意位置， 但必须是在一个字的边界，也就是说必须是2的整数倍。
    }

    /// <summary>
    /// BigTiff 图像文件头Image File Header(IFH)
    /// </summary>
    [StructLayout(LayoutKind.Sequential)]
    public struct BigTiffImageFileHeader
    {
        public ushort ByteOrder;//字节顺序标志位， 值为II或者MM。II表示小字节在前， 又称为little-endian。MM表示大字节在前，又成为big-endian。
        public ushort Marker;//TIFF的标志位，0x002B
        public ushort OffsetByteSize;//bytesize of offsets 0x0008 
        public ushort Reserve;//constant 0x0000 
        public ulong FirstIFD;//第一个IFD的偏移量。可以在任意位置， 但必须是在一个字的边界，也就是说必须是2的整数倍。
    }

    /// <summary>
    /// Tiff 图像文件目录Image File Directory(IFD)
    /// </summary>
    [StructLayout(LayoutKind.Sequential)]
    public struct TiffImageFileDirectory
    {
        public ushort DECount; //表示此IFD包含了多少个DE
        public uint FirstDE;//第一个DE的偏移量，（此处未按实际数据内容定义,此处实际为n个n个DE的值）
        public uint NextIFD;//下一个IFD的偏移量，如果没有则置为0
    }

    /// <summary>
    /// BigTiff 图像文件目录Image File Directory(IFD)
    /// </summary>
    [StructLayout(LayoutKind.Sequential)]
    public struct BigTiffImageFileDirectory
    {
        public ulong DECount; //表示此IFD包含了多少个DE
        public ulong FirstDE;//第一个DE的偏移量，（此处未按实际数据内容定义,此处实际为n个n个DE的值）
        public ulong NextIFD;//下一个IFD的偏移量，如果没有则置为0
    }

    /// <summary>
    /// Tiff 目录项Directory Entry(DE)
    /// </summary>
    [StructLayout(LayoutKind.Sequential)]
    public struct TiffDirectoryEntry
    {
        public ushort TagID; //此TAG的唯一标识
        public ushort DataType;//数据类型。
        public uint Count;// 数量。通过类型和数量可以确定存储此TAG的数据需要占据的字节数
        public uint DataOrPtr;//如果占用的字节数少于4， 则数据直接存于此。 如果超过4个，则这里存放的是指向实际数据的指针
    }

    /// <summary>
    /// BigTiff 目录项Directory Entry(DE)
    /// </summary>
    [StructLayout(LayoutKind.Sequential)]
    public struct BigTiffDirectoryEntry
    {
        public ushort TagID; //此TAG的唯一标识
        public ushort DataType;//数据类型。
        public ulong Count;// 数量。通过类型和数量可以确定存储此TAG的数据需要占据的字节数
        public ulong DataOrPtr;//如果占用的字节数少于8， 则数据直接存于此。 如果超过8个，则这里存放的是指向实际数据的指针
    }

    /// <summary>
    /// Tiff 目录项Directory Entry(DE)的数据类型
    /// </summary>
    public enum TiffDEDataType : ushort
    {
        BYTE        = 1,//8-bit unsigned integer
        ASCII       = 2,//8-bit byte that contains a 7-bit ASCII code; the last byte must be NUL (binary zero).
        SHORT       = 3,//16-bit (2-byte) unsigned integer.
        LONG        = 4,//32-bit (4-byte) unsigned integer.
        RATIONAL    = 5,//Two LONGs: the first represents the numerator 分数类型，由两个Long组成，第1个是分子，第2个是分母
        SBYTE       = 6,//An 8-bit signed (twos-complement) integer.
        UNDEFINED   = 7,//An 8-bit byte that may contain anything, depending on the definition of the field.
        SSHORT      = 8,//A 16-bit (2-byte) signed (twos-complement) integer.
        SLONG       = 9,//A 32-bit (4-byte) signed (twos-complement) integer.
        SRATIONAL   = 10,//Two SLONG’s: the first represents the numerator of a fraction, the second the denominator.
        FLOAT       = 11,//Single precision (4-byte) IEEE format.
        DOUBLE      = 12//Double precision (8-byte) IEEE format.
    }
    
    /// <summary>
    /// Tiff 目录项Directory Entry(DE)的标识
    /// </summary>
    public enum TiffDETag : ushort
    {
        //Baseline  TIFF Tags http://www.awaresystems.be/imaging/tiff/tifftags/baseline.html
        NewSubfileType              = 0x00FE,//
        SubfileType                 = 0x00FF,//
        ImageWidth                  = 0x0100,//图像宽
        ImageLength                 = 0x0101,//图像高
        BitsPerSample               = 0x0102,//颜色深度 值＝1为单色，＝4为16色，＝8为256色。如果该类型数据个数＞2个，说明是真彩图像
        Compression                 = 0x0103,//图像数据是否压缩 1 = No compression 5＝LZW 
        PhotometricInterpretation   = 0x0106,//图像颜色空间 0 = WhiteIsZero. 1 = BlackIsZero. 2 = RGB
        Threshholding               = 0x0107,//
        CellWidth                   = 0x0108,//
        CellLength                  = 0x0109,//
        FillOrder                   = 0x010A,//
        ImageDescription            = 0x010E,//
        Make                        = 0x010F,//
        Model                       = 0x0110,//
        StripOffsets                = 0x0111,//图像每块的开始位置 
        Orientation                 = 0x0112,//方向
        SamplesPerPixel             = 0x0115,//每像素样本数，RGB图为3
        RowsPerStrip                = 0x0116,//图像分成的每块行数，默认2**32 - 1 StripsPerImage = floor ((ImageLength + RowsPerStrip - 1) / RowsPerStrip).
        StripByteCounts             = 0x0117,//压缩后图像每块的字节总数
        MinSampleValue              = 0x0118,//
        MaxSampleValue              = 0x0119,//
        XResolution                 = 0x011A,//水平分辩率偏移量 常用计量单位是：像素/英寸
        YResolution                 = 0x011B,//垂直分辩率 偏移量 常用计量单位是：像素/英寸
        PlanarConfiguration         = 0x011C,//每个像素各部分存储方式，默认为1(Chunky)，即RGB数据存储为RGBRGBRGB
        FreeOffsets                 = 0x0120,//
        FreeByteCounts              = 0x0121,//
        GrayResponseUnit            = 0x0122,//
        GrayResponseCurve           = 0x0123,//
        ResolutionUnit              = 0x0128,//XResolution 和 YResolution 的单位，默认为2 (Inch)
        Software                    = 0x0131,//生成该图像的软件名 文本类型
        DateTime                    = 0x0132,//生成该图像的时间 文本类型
        Artist                      = 0x013B,//
        HostComputer                = 0x013C,//
        ColorMap                    = 0x0140,//调色板偏移量 256色和16色图像才有此属性，而且有连续2个调色板，但属性的length值只表示出1个调色板
        ExtraSamples                = 0x0152,//
        Copyright                   = 0x8298//
    }


    public class TiffFileWriter
    {
        private string _filePath;
        private uint _width;
        private uint _height;
        private FileStream _fs;
        private int _ImageDataOffset;

        private const int TIFF_DE_LENGTH = 12;
        private const int BIGTIFF_DE_LENGTH = 20;

        public long ImageDataLength
        {
            get { return (long)this._width * (long)this._height * 3L; }
        }

        public void CreateFile(string filePath, uint width, uint height)
        {
            this._filePath = filePath;
            this._height = height;
            this._width = width;

            _fs = File.Create(filePath);
        }

        public void WriteTiffHeader()
        {
            long fileSize = this.ImageDataLength + 512;//大致计算
            if (fileSize > (long)(uint.MaxValue))
            {
                WriteBigTiffHeader();
            }
            else
            {
                WriteStandardTiffHeader();
            }
        }

        public unsafe void WriteStandardTiffHeader()
        {
            //IFH
            TiffImageFileHeader ifh = new TiffImageFileHeader();
            ifh.ByteOrder = 0x4949;
            ifh.Marker = 0x002A;
            ifh.FirstIFD = 0x00000008;

            //第一个IFD，这里只一个
            TiffImageFileDirectory ifd = new TiffImageFileDirectory();
            ifd.DECount = 10;
            ifd.NextIFD = 0;

            int headerLength = sizeof(TiffImageFileHeader) + Marshal.SizeOf(ifd.DECount) + TIFF_DE_LENGTH * ifd.DECount + Marshal.SizeOf(ifd.NextIFD); //tiff文件头长度，不包含DE的数据部分，按1个IFD，10个DE计算
            int headerDataLength = 6;//DE的数据部分长度,
            int headerDataOffset = headerLength;//DE的数据部分偏移量
            this._ImageDataOffset = headerLength + headerDataLength;


            byte[] headerData = new byte[this._ImageDataOffset];
            //IFH
            CopyData2Array((byte*)&ifh, sizeof(TiffImageFileHeader), headerData, 0);
            //IFD
            CopyData2Array((byte*)&(ifd.DECount), Marshal.SizeOf(ifd.DECount), headerData, sizeof(TiffImageFileHeader));
            //DE
            #region 开始逐条添加DE
            int deLength = TIFF_DE_LENGTH;
            int deOffset = sizeof(TiffImageFileHeader) + Marshal.SizeOf(ifd.DECount);
            fixed(TiffDirectoryEntry* deArray = new TiffDirectoryEntry[ifd.DECount])
            {
                int idx = 0;
                //图像宽
                deArray[idx] = new TiffDirectoryEntry { TagID = (ushort)TiffDETag.ImageWidth, DataType = (ushort)TiffDEDataType.SHORT, Count = 1, DataOrPtr = this._width };
                CopyData2Array((byte*)&(deArray[idx]), deLength, headerData, deOffset + idx * deLength);
                //图像高
                idx = 1;
                deArray[idx] = new TiffDirectoryEntry { TagID = (ushort)TiffDETag.ImageLength, DataType = (ushort)TiffDEDataType.SHORT, Count = 1, DataOrPtr = this._height };
                CopyData2Array((byte*)&(deArray[idx]), deLength, headerData, deOffset + idx * deLength);
                //颜色深度
                idx = 2;
                deArray[idx] = new TiffDirectoryEntry { TagID = (ushort)TiffDETag.BitsPerSample, DataType = (ushort)TiffDEDataType.SHORT, Count = 3, DataOrPtr = (uint)headerDataOffset };
                CopyData2Array((byte*)&(deArray[idx]), deLength, headerData, deOffset + idx * deLength);
                byte[] colorDepth = new byte[] { 0x08, 0x00, 0x08, 0x00, 0x08, 0x00 };
                CopyData2Array(colorDepth, headerData, (int)headerDataOffset);
                headerDataOffset += colorDepth.Length;
                //图片压缩
                idx = 3;
                deArray[idx] = new TiffDirectoryEntry { TagID = (ushort)TiffDETag.Compression, DataType = (ushort)TiffDEDataType.SHORT, Count = 1, DataOrPtr = 1 };
                CopyData2Array((byte*)&(deArray[idx]), deLength, headerData, deOffset + idx * deLength);
                //颜色空间
                idx = 4;
                deArray[idx] = new TiffDirectoryEntry { TagID = (ushort)TiffDETag.PhotometricInterpretation, DataType = (ushort)TiffDEDataType.SHORT, Count = 1, DataOrPtr = 2 };
                CopyData2Array((byte*)&(deArray[idx]), deLength, headerData, deOffset + idx * deLength);
                //图像扫描线偏移量
                idx = 5;
                deArray[idx] = new TiffDirectoryEntry { TagID = (ushort)TiffDETag.StripOffsets, DataType = (ushort)TiffDEDataType.LONG, Count = 1, DataOrPtr = (uint)headerData.Length };
                CopyData2Array((byte*)&(deArray[idx]), deLength, headerData, deOffset + idx * deLength);
                //方向
                idx = 6;
                deArray[idx] = new TiffDirectoryEntry { TagID = (ushort)TiffDETag.Orientation, DataType = (ushort)TiffDEDataType.SHORT, Count = 1, DataOrPtr = 1 };
                CopyData2Array((byte*)&(deArray[idx]), deLength, headerData, deOffset + idx * deLength);
                //每像素样本
                idx = 7;
                deArray[idx] = new TiffDirectoryEntry { TagID = (ushort)TiffDETag.SamplesPerPixel, DataType = (ushort)TiffDEDataType.SHORT, Count = 1, DataOrPtr = 3 };
                CopyData2Array((byte*)&(deArray[idx]), deLength, headerData, deOffset + idx * deLength);
                //每块行数
                idx = 8;
                deArray[idx] = new TiffDirectoryEntry { TagID = (ushort)TiffDETag.RowsPerStrip, DataType = (ushort)TiffDEDataType.LONG, Count = 1, DataOrPtr = this._height };
                CopyData2Array((byte*)&(deArray[idx]), deLength, headerData, deOffset + idx * deLength);
                //每块的字节数
                idx = 9;
                deArray[idx] = new TiffDirectoryEntry { TagID = (ushort)TiffDETag.StripByteCounts, DataType = (ushort)TiffDEDataType.LONG, Count = 1, DataOrPtr = (uint)this.ImageDataLength };
                CopyData2Array((byte*)&(deArray[idx]), deLength, headerData, deOffset + idx * deLength);
            }

            #endregion

            _fs.Write(headerData, 0, headerData.Length);
            
        }

        public unsafe void WriteBigTiffHeader()
        {
            //IFH
            BigTiffImageFileHeader ifh = new BigTiffImageFileHeader();
            ifh.ByteOrder = 0x4949;
            ifh.Marker = 0x002B;
            ifh.OffsetByteSize = 0x0008;
            ifh.FirstIFD = 0x00000010;

            //第一个IFD，这里只一个
            BigTiffImageFileDirectory ifd = new BigTiffImageFileDirectory();
            ifd.DECount = 10;
            ifd.NextIFD = 0;

            int headerLength = sizeof(BigTiffImageFileHeader) + Marshal.SizeOf(ifd.DECount) + BIGTIFF_DE_LENGTH * (int)ifd.DECount + Marshal.SizeOf(ifd.NextIFD); //tiff文件头长度，不包含DE的数据部分，按1个IFD，10个DE计算
            int headerDataLength = 0;//DE的数据部分长度,
            int headerDataOffset = headerLength;//DE的数据部分偏移量
            this._ImageDataOffset = headerLength + headerDataLength;


            byte[] headerData = new byte[this._ImageDataOffset];
            //IFH
            CopyData2Array((byte*)&ifh, sizeof(BigTiffImageFileHeader), headerData, 0);
            //IFD
            CopyData2Array((byte*)&(ifd.DECount), Marshal.SizeOf(ifd.DECount), headerData, sizeof(BigTiffImageFileHeader));
            //DE
            #region 开始逐条添加DE
            int deLength = BIGTIFF_DE_LENGTH;
            int deOffset = sizeof(BigTiffImageFileHeader) + Marshal.SizeOf(ifd.DECount);
            fixed (BigTiffDirectoryEntry* deArray = new BigTiffDirectoryEntry[ifd.DECount])
            {
                int idx = 0;
                //图像宽
                deArray[idx] = new BigTiffDirectoryEntry { TagID = (ushort)TiffDETag.ImageWidth, DataType = (ushort)TiffDEDataType.LONG, Count = 1L, DataOrPtr = this._width };
                CopyData2Array(deArray[idx], deLength, headerData, deOffset + idx * deLength);
                //图像高
                idx = 1;
                deArray[idx] = new BigTiffDirectoryEntry { TagID = (ushort)TiffDETag.ImageLength, DataType = (ushort)TiffDEDataType.LONG, Count = 1L, DataOrPtr = this._height };
                CopyData2Array(deArray[idx], deLength, headerData, deOffset + idx * deLength);
                //颜色深度
                idx = 2;
                deArray[idx] = new BigTiffDirectoryEntry { TagID = (ushort)TiffDETag.BitsPerSample, DataType = (ushort)TiffDEDataType.SHORT, Count = 3L, DataOrPtr = 0x000800080008 };
                CopyData2Array(deArray[idx], deLength, headerData, deOffset + idx * deLength);
                //图片压缩
                idx = 3;
                deArray[idx] = new BigTiffDirectoryEntry { TagID = (ushort)TiffDETag.Compression, DataType = (ushort)TiffDEDataType.SHORT, Count = 1L, DataOrPtr = 1 };
                CopyData2Array(deArray[idx], deLength, headerData, deOffset + idx * deLength);
                //颜色空间
                idx = 4;
                deArray[idx] = new BigTiffDirectoryEntry { TagID = (ushort)TiffDETag.PhotometricInterpretation, DataType = (ushort)TiffDEDataType.SHORT, Count = 1L, DataOrPtr = 2 };
                CopyData2Array(deArray[idx], deLength, headerData, deOffset + idx * deLength);
                //图像扫描线偏移量
                idx = 5;
                deArray[idx] = new BigTiffDirectoryEntry { TagID = (ushort)TiffDETag.StripOffsets, DataType = (ushort)TiffDEDataType.LONG, Count = 1L, DataOrPtr = (uint)headerData.Length };
                CopyData2Array(deArray[idx], deLength, headerData, deOffset + idx * deLength);
                //方向
                idx = 6;
                deArray[idx] = new BigTiffDirectoryEntry { TagID = (ushort)TiffDETag.Orientation, DataType = (ushort)TiffDEDataType.SHORT, Count = 1L, DataOrPtr = 1 };
                CopyData2Array(deArray[idx], deLength, headerData, deOffset + idx * deLength);
                //每像素样本
                idx = 7;
                deArray[idx] = new BigTiffDirectoryEntry { TagID = (ushort)TiffDETag.SamplesPerPixel, DataType = (ushort)TiffDEDataType.SHORT, Count = 1L, DataOrPtr = 3 };
                CopyData2Array(deArray[idx], deLength, headerData, deOffset + idx * deLength);
                //每块行数
                idx = 8;
                deArray[idx] = new BigTiffDirectoryEntry { TagID = (ushort)TiffDETag.RowsPerStrip, DataType = (ushort)TiffDEDataType.LONG, Count = 1L, DataOrPtr = this._height };
                CopyData2Array(deArray[idx], deLength, headerData, deOffset + idx * deLength);
                //每块的字节数
                idx = 9;
                deArray[idx] = new BigTiffDirectoryEntry { TagID = (ushort)TiffDETag.StripByteCounts, DataType = (ushort)TiffDEDataType.LONG, Count = 1L, DataOrPtr = (ulong)this.ImageDataLength };
                CopyData2Array(deArray[idx], deLength, headerData, deOffset + idx * deLength);
            }

            #endregion

            _fs.Write(headerData, 0, headerData.Length);

        }

        /// <summary>
        /// 一次写入整行瓦片数据
        /// </summary>
        /// <param name="bitmapLs"></param>
        /// <param name="?"></param>
        public void WriteImageData(List<Bitmap> bitmapLs)
        {
            int bmpWidth = 256;
            int bmpHeigth = 256;
            int copyDataLength = bmpWidth * 3;

            byte[] data = new byte[bitmapLs.Count * bmpHeigth * copyDataLength];

            unsafe
            {
                List<BitmapData> bmpDataLs = new List<BitmapData>(bitmapLs.Count);
                Rectangle rect = new Rectangle(0, 0, bmpWidth, bmpHeigth);
                for (int i = 0; i < bitmapLs.Count; i++)
                {
                    bmpDataLs.Add(bitmapLs[i].LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb));

                }

                for (int i = 0; i < bmpHeigth; i++)
                {
                    for (int j = 0; j < bmpDataLs.Count; j++)
                    {
                        //Marshal.Copy(bmpDataLs[j].Scan0 + i * copyDataLength, data, (i * bmpDataLs.Count + j) * copyDataLength, copyDataLength);
                        //颜色需要由BGR转为RGB
                        byte* ptr = (byte*)bmpDataLs[j].Scan0;
                        for (int k = 0; k < bmpWidth; k++)
                        {
                            int dataIdx = (i * bmpDataLs.Count + j) * copyDataLength + k * 3;
                            int ptrIdx = i * copyDataLength + k * 3;
                            data[dataIdx] = *(ptr + ptrIdx + 2);
                            data[dataIdx + 1] = *(ptr + ptrIdx + 1);
                            data[dataIdx + 2] = *(ptr + ptrIdx);
                        }
                    }
                }


                for (int i = 0; i < bitmapLs.Count; i++)
                {
                     bitmapLs[i].UnlockBits(bmpDataLs[i]);

                }
            }

            _fs.Write(data, 0, data.Length);
        }

        public void CloseFile()
        {
            if (_fs != null)
            {
                _fs.Close();
            }
        }


        private unsafe static void CopyData2Array(byte* src,int length,byte[] distData,int offset)
        {
            int max = offset + length;
            if (distData.Length >= max)
            {
                for (int i = offset; i < max; ++i)
                {
                    distData[i] = *src++;
                }
            }
        }
        private unsafe static void CopyData2Array(BigTiffDirectoryEntry src, int length, byte[] distData, int offset)
        {
            int max = offset + length;
            int distOff = offset;
            if (distData.Length >= max)
            {
                byte[] data = BitConverter.GetBytes(src.TagID);
                Array.Copy(data, 0, distData, distOff, sizeof(ushort));
                distOff += sizeof(ushort);

                data = BitConverter.GetBytes(src.DataType);
                Array.Copy(data, 0, distData, distOff, sizeof(ushort));
                distOff += sizeof(ushort);

                data = BitConverter.GetBytes(src.Count);
                Array.Copy(data, 0, distData, distOff, sizeof(ulong));
                distOff += sizeof(ulong);

                data = BitConverter.GetBytes(src.DataOrPtr);
                Array.Copy(data, 0, distData, distOff, sizeof(ulong));
                distOff += sizeof(ulong);
            }
        }
        private static void CopyData2Array(byte[] src,byte[] distData, int offset)
        {
            int max = offset + src.Length;
            if (distData.Length >= max)
            {
                src.CopyTo(distData, offset);
            }
        }

    }
}
