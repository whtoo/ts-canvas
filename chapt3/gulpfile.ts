import * as gulp from 'gulp'
import path from 'path'
import fse from 'fs-extra'
import chalk from 'chalk'
import { rollup } from 'rollup'
import { create } from 'browser-sync'
const browserSync = create('watch-ts');
const reload = browserSync.reload;

import {
  Extractor,
  ExtractorConfig,
  ExtractorResult,
} from '@microsoft/api-extractor'
import rollupConfig from './rollup.config'
// gulpfile
import conventionalChangelog from 'conventional-changelog'

interface TaskFunc {
  (cb: Function): void
}

// 自定义生成 changelog
export const changelog: TaskFunc = async (cb) => {
    const changelogPath: string = path.join(paths.root, 'CHANGELOG.md')
    // 对命令 conventional-changelog -p angular -i CHANGELOG.md -w -r 0
    const changelogPipe = await conventionalChangelog({
      preset: 'angular',
      releaseCount: 0,
    })
    changelogPipe.setEncoding('utf8')
  
    const resultArray = ['# 工具库更新日志\n\n']
    changelogPipe.on('data', (chunk) => {
      // 原来的 commits 路径是进入提交列表
      chunk = chunk.replace(/\/commits\//g, '/commit/')
      resultArray.push(chunk)
    })
    changelogPipe.on('end', async () => {
      await fse.createWriteStream(changelogPath).write(resultArray.join(''))
      cb()
    })
  }

  
const log = {
  progress: (text: string) => {
    console.log(chalk.green(text))
  },
  error: (text: string) => {
    console.log(chalk.red(text))
  },
}

const paths = {
  root: path.join(__dirname, '/'),
  lib: path.join(__dirname, '/lib'),
  dist:path.join(__dirname,'/dist')
}


// 删除 lib 文件
const clearLibFile: TaskFunc = async (cb) => {
  fse.removeSync(paths.lib)
  log.progress('Deleted lib file')
  fse.copySync(paths.dist,paths.lib);
  reload({stream:true})
  cb()
}

// rollup 打包
const buildByRollup: TaskFunc = async (cb) => {
  const inputOptions = {
    input: rollupConfig.input,
    external: rollupConfig.external,
    plugins: rollupConfig.plugins,
  }
  const outOptions = rollupConfig.output
  const bundle = await rollup(inputOptions)

  // 写入需要遍历输出配置
  if (Array.isArray(outOptions)) {
    outOptions.forEach(async (outOption) => {
      await bundle.write(outOption)
    })
    reload({stream:true})
    log.progress('Rollup built successfully')
    cb()
  }
}

// api-extractor 整理 .d.ts 文件
const apiExtractorGenerate: TaskFunc = async (cb) => {
  const apiExtractorJsonPath: string = path.join(__dirname, './api-extractor.json')
  // 加载并解析 api-extractor.json 文件
  const extractorConfig: ExtractorConfig = await ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath)
  // 判断是否存在 index.d.ts 文件，这里必须异步先访问一边，不然后面找不到会报错
  const isExist: boolean = await fse.pathExists(extractorConfig.mainEntryPointFilePath)

  if (!isExist) {
    log.error('API Extractor not find index.d.ts')
    return
  }

  // 调用 API
  const extractorResult: ExtractorResult = await Extractor.invoke(extractorConfig, {
    localBuild: true,
    // 在输出中显示信息
    showVerboseMessages: true,
  })

  if (extractorResult.succeeded) {
    // 删除多余的 .d.ts 文件
    const libFiles: string[] = await fse.readdir(paths.lib)
    libFiles.forEach(async file => {
      if (file.endsWith('.d.ts') && !file.includes('index')) {
        await fse.remove(path.join(paths.lib, file))
      }
    })
    log.progress('API Extractor completed successfully')
    cb()
  } else {
    log.error(`API Extractor completed with ${extractorResult.errorCount} errors`
      + ` and ${extractorResult.warningCount} warnings`)
  }
}

const browerServer = (cb) => {
  browserSync.init({
    server: {
      baseDir: "./lib/"
    }
  }),
  gulp.watch('./src/**/*.ts',gulp.series(buildByRollup)).on('change',reload)
  gulp.watch('./dist/*.html',gulp.series(clearLibFile)).on('change',reload)
  cb()
}

const complete: TaskFunc = (cb) => {
  log.progress('---- end ----')
  cb()
}

// 构建过程
// 1. 删除 lib 文件夹
// 2. rollup 打包
// 3. api-extractor 生成统一的声明文件, 删除多余的声明文件
// 4. 进行git diff生成change log。
// 5. 完成
export const build = gulp.series(clearLibFile, buildByRollup, browerServer)