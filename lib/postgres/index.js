const pg = require('pg');
const { log } = require('../logger');

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

pool.query(`CREATE TABLE IF NOT EXISTS sysperf_results (
    id text,
    secret text,
    hardware_cpu_model text,
    hardware_cpu_cores integer,
    hardware_cpu_speed integer,
    hardware_ram_total bigint,
    hardware_ram_used bigint,
    hardware_swap_total bigint,
    hardware_swap_used bigint,
    network_isp text,
    network_asn text,
    network_IPv6 boolean,
    misc_os text,
    misc_kernel text,
    misc_arch text,
    benchmark_geekbench_single integer,
    benchmark_geekbench_multi integer,
    benchmark_geekbench_url text,
    benchmark_io_s1 integer,
    benchmark_io_s2 integer,
    benchmark_io_s3 integer,
    benchmark_io_iops_write double precision,
    benchmark_io_iops_read double precision,
    time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id))`, (err) => {
    if (err) { log.error(`Table-gen: Error sysperf_results ${err}`) }
});

const addResult = (id, secret, Hardware, Network, MISC, BENCHMARKS) => {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO sysperf_results (id, secret, hardware_cpu_model, hardware_cpu_cores, hardware_cpu_speed, hardware_ram_total, hardware_ram_used, hardware_swap_total, hardware_swap_used, network_isp, network_asn, network_IPv6, misc_os, misc_kernel, misc_arch, benchmark_geekbench_single, benchmark_geekbench_multi, benchmark_geekbench_url, benchmark_io_s1, benchmark_io_s2, benchmark_io_s3, benchmark_io_iops_write, benchmark_io_iops_read) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`, [id, secret, Hardware.CPU.Model, Hardware.CPU.Cores, Hardware.CPU.Speed, Hardware.RAM.Total, Hardware.RAM.Used, Hardware.Swap.Total, Hardware.Swap.Used, Network.ISP, Network.ASN, Network.IPv6, MISC.OS, MISC.Kernel, MISC.Arch, BENCHMARKS.Geekbench.Single, BENCHMARKS.Geekbench.Multi, BENCHMARKS.Geekbench.URL, BENCHMARKS.IO.Sequential_1, BENCHMARKS.IO.Sequential_2, BENCHMARKS.IO.Sequential_3, BENCHMARKS.IO.iops_write, BENCHMARKS.IO.iops_read], (err, res) => {
            if (err) { 
                log.error(err.message)
                reject(new Error('DBError')) 
            }
            resolve(res);
        });
    });
}

const insert = {
    result: {
        add: addResult
    }
}

module.exports = {
    insert
}