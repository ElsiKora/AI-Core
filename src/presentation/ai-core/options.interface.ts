/* eslint-disable @elsikora/check-file/folder-match-with-fex */
import type { IBeanFactoryOptionsInterface } from "@elsikora/bean";

import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface.js";

/**
 * Public adapter initialization options.
 */
export interface IAiCoreAdapterOptions {
	beanOptions?: IBeanFactoryOptionsInterface;
	cliInterface?: ICliInterfaceService;
}
