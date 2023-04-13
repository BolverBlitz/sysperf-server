const Joi = require('joi');
const HyperExpress = require('hyper-express');
const randomstring = require('randomstring');
const router = new HyperExpress.Router();
const { log } = require('@lib/logger');
const db = require('@lib/postgres');

/* Plugin info*/
const PluginName = 'sysperf'; //This plugins name
const PluginRequirements = []; //Put your Requirements and version here <Name, not file name>|Version
const PluginVersion = '0.0.1'; //This plugins version
const PluginAuthor = 'BolverBlitz';
const PluginDocs = '';

const sysperfInput = Joi.object({
    'Hardware': Joi.object({
        'CPU': Joi.object({
            'Model': Joi.string().empty(['', null]).default('EMPTY'),
            'Cores': Joi.number().empty(['', null]).default('EMPTY').max(2147483647).min(0),
            'Speed': Joi.number().empty(['', null]).default('EMPTY').max(2147483647).min(0),
        }).required(),
        'RAM': Joi.object({
            'Total': Joi.number().max(9223372036854775807).min(0).required(),
            'Used': Joi.number().max(9223372036854775807).min(0).required(),
        }).required(),
        'Swap': Joi.object({
            'Total': Joi.number().max(9223372036854775807).min(0).required(),
            'Used': Joi.number().max(9223372036854775807).min(0).required(),
        }).required(),
    }).required(),
    'Network': Joi.object({
        'ISP': Joi.string().required(),
        'ASN': Joi.string().required(),
        'IPv6': Joi.string().allow('', null).empty(['', null]).default('EMPTY'),
    }).required(),
    'MISC': Joi.object({
        'Kernel': Joi.string().required(),
        'OS': Joi.string().required(),
        'Arch': Joi.string().required(),
    }).required(),
    'BENCHMARKS': Joi.object({
        'Geekbench': Joi.object({
            'Single': Joi.number().max(2147483647).min(0).required(),
            'Multi': Joi.number().max(2147483647).min(0).required(),
            'URL': Joi.string().required().regex(/https:\/\/browser\.geekbench\.com\/v5\/cpu\/\d+/),
        }).required(),
        'IO': Joi.object({
            'Sequential_1': Joi.number().max(2147483647).min(0).required(),
            'Sequential_2': Joi.number().max(2147483647).min(0).required(),
            'Sequential_3': Joi.number().max(2147483647).min(0).required(),
            'iops_read': Joi.number().max(2147483647).min(0).required(),
            'iops_write': Joi.number().max(2147483647).min(0).required(),
        }).required(),
    }).required(),
});

router.post('/new', async (req, res) => {
    const value = await sysperfInput.validateAsync(await req.json());
    if (!value) throw Error('Invalid input');

    // Convert IPv6 to boolean
    if (value.Network.IPv6 === 'EMPTY') {
        value.Network.IPv6 = false;
    } else {
        value.Network.IPv6 = true;
    }

    let id = randomstring.generate({
        length: 16,
        charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
    });

    const secret = randomstring.generate({
        length: 8,
        charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
    });

    const dbInsert = await db.insert.result.add(id, secret, value.Hardware, value.Network, value.MISC, value.BENCHMARKS);

    if (dbInsert.rowCount === 1) {
        res.status(200);
        res.send(`Thank you for your submission!\nYour ID is: ${id}\nYour secret is: ${secret}\n`)
    } else {
        throw new Error('Failed to insert data');
    }
});

module.exports = {
    router: router,
    PluginName: PluginName,
    PluginRequirements: PluginRequirements,
    PluginVersion: PluginVersion,
    PluginAuthor: PluginAuthor,
    PluginDocs: PluginDocs
};